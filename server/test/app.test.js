import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Filter } from 'bad-words';
import { createApp, isValidData } from '../app.js';

let mongod;
let app;
let mews;
let close;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const result = await createApp({
        mongoUri: mongod.getUri(),
        version: 'test',
        rateLimitMax: 100
    });
    app = result.app;
    mews = result.mews;
    close = result.close;
});

afterAll(async () => {
    await close();
    await mongod.stop();
});

beforeEach(async () => {
    await mews.deleteMany({});
});

describe('isValidData', () => {
    it('returns false for empty or whitespace values', () => {
        expect(isValidData('')).toBe(false);
        expect(isValidData('   ')).toBe(false);
        expect(isValidData(null)).toBe(false);
        expect(isValidData(undefined)).toBe(false);
    });

    it('returns true for non-empty values', () => {
        expect(isValidData('Whiskers')).toBe(true);
        expect(isValidData(' meow ')).toBe(true);
    });
});

describe('GET /', () => {
    it('returns the app version message', async () => {
        const res = await request(app).get('/');

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('meower 😺 test');
    });
});

describe('GET /meows', () => {
    it('returns an empty feed initially', async () => {
        const res = await request(app).get('/meows');

        expect(res.status).toBe(200);
        expect(res.body.mews).toEqual([]);
        expect(res.body.meta).toMatchObject({
            total: 0,
            page: 1,
            perPage: 5,
            has_more: false
        });
    });

    it('returns meows sorted newest first by default', async () => {
        await mews.insertMany([
            { name: 'Old', content: 'first', created: new Date('2024-01-01') },
            { name: 'New', content: 'second', created: new Date('2024-06-01') }
        ]);

        const res = await request(app).get('/meows');

        expect(res.status).toBe(200);
        expect(res.body.mews).toHaveLength(2);
        expect(res.body.mews[0].content).toBe('second');
        expect(res.body.mews[1].content).toBe('first');
        expect(res.body.meta.total).toBe(2);
    });

    it('paginates results', async () => {
        await mews.insertMany([
            { name: 'A', content: '1', created: new Date('2024-01-03') },
            { name: 'B', content: '2', created: new Date('2024-01-02') },
            { name: 'C', content: '3', created: new Date('2024-01-01') }
        ]);

        const res = await request(app).get('/meows?page=2&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.mews).toHaveLength(1);
        expect(res.body.mews[0].content).toBe('3');
        expect(res.body.meta).toMatchObject({
            total: 3,
            page: 2,
            perPage: 2,
            has_more: false
        });
    });
});

describe('POST /meows', () => {
    it('returns 422 when name is missing', async () => {
        const res = await request(app)
            .post('/meows')
            .send({ name: '   ', content: 'hello' });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe('Name is required');
    });

    it('returns 422 when content is missing', async () => {
        const res = await request(app)
            .post('/meows')
            .send({ name: 'Whiskers', content: '' });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe('Content is required');
    });

    it('creates a meow and stores it in the database', async () => {
        const res = await request(app)
            .post('/meows')
            .send({ name: 'Whiskers', content: 'Meow!' });

        expect(res.status).toBe(200);
        expect(res.body.acknowledged).toBe(true);

        const stored = await mews.findOne({ name: 'Whiskers' });
        expect(stored.content).toBe('Meow!');
        expect(stored.created).toBeInstanceOf(Date);
    });

    it('filters profanity from name and content', async () => {
        const filter = new Filter();
        const profane = 'shitty';
        expect(filter.clean(profane)).not.toBe(profane);

        const res = await request(app)
            .post('/meows')
            .send({ name: profane, content: `this is ${profane}` });

        expect(res.status).toBe(200);

        const stored = await mews.findOne({});
        expect(stored.name).toBe(filter.clean(profane));
        expect(stored.content).toBe(filter.clean(`this is ${profane}`));
    });
});

describe('rate limiting', () => {
    it('returns 429 when posting too quickly', async () => {
        const limitedApp = await createApp({
            mongoUri: mongod.getUri(),
            rateLimitMax: 1
        });

        const first = await request(limitedApp.app)
            .post('/meows')
            .send({ name: 'Cat', content: 'First' });
        const second = await request(limitedApp.app)
            .post('/meows')
            .send({ name: 'Cat', content: 'Second' });

        expect(first.status).toBe(200);
        expect(second.status).toBe(429);

        await limitedApp.close();
    });
});
