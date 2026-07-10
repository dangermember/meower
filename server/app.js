import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { Filter } from 'bad-words';
import rateLimit from 'express-rate-limit';

export function isValidData(data) {
    return Boolean(data && data.toString().trim() !== '');
}

export async function createApp(options = {}) {
    const mongoUri = options.mongoUri ?? process.env.MONGO_URI ?? 'mongodb://localhost/meower';
    const clientUri = options.clientUri ?? process.env.CLIENT_URI ?? 'http://localhost:3000';
    const version = options.version ?? process.env.VERSION ?? '1.0.0';
    const rateLimitMax = options.rateLimitMax ?? 1;

    const app = express();
    app.disable('x-powered-by');

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const mews = db.collection('mews');
    await mews.createIndex({ created: -1 });
    const filter = new Filter();

    app.use(cors({
        origin: clientUri,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
    }));
    app.use(express.json());

    app.get('/', (req, res) => {
        res.json({
            message: 'meower 😺 ' + version
        });
    });

    app.get('/meows', (req, res, next) => {
        const { page = 1, limit = 5, sort = 'desc' } = req.query;
        const perPage = Math.min(50, Math.max(1, Number.parseInt(limit, 10)));
        const skip = Math.max((Number(page) - 1) * perPage, 0);
        Promise.all([
            mews.countDocuments(),
            mews.find().sort('created', sort === 'desc' ? -1 : 1).skip(skip).limit(perPage).toArray()
        ])
            .then(([total, mewsList]) => {
                res.json({
                    mews: mewsList,
                    meta: {
                        total,
                        page: Number(page),
                        perPage,
                        has_more: total - (skip + perPage) > 0,
                    }
                });
            }).catch(next);
    });

    app.use(rateLimit({
        windowMs: 3 * 1000,
        max: rateLimitMax,
        message: 'Too many requests from this IP, please try again after 30 seconds'
    }));

    app.post('/meows', (req, res, next) => {
        const name = req.body.name?.toString() ?? '';
        const content = req.body.content?.toString() ?? '';
        if (!isValidData(name)) {
            res.status(422).json({
                message: 'Name is required'
            });
            return;
        }
        if (!isValidData(content)) {
            res.status(422).json({
                message: 'Content is required'
            });
            return;
        }
        const meow = {
            name: filter.clean(name),
            content: filter.clean(content),
            created: new Date()
        };
        mews.insertOne(meow)
            .then((createdMeow) => {
                res.json(createdMeow);
            })
            .catch(next);
    });

    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    });

    return {
        app,
        mews,
        close: () => client.close()
    };
}
