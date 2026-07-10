import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    createMeowElement,
    formatMeowDate,
    showError,
    setupClient
} from '../client.js';

function buildDom() {
    document.body.innerHTML = `
        <div class="loading"></div>
        <form class="meow-form">
            <input name="name" />
            <textarea name="content"></textarea>
            <button type="submit">Send</button>
        </form>
        <div class="meows-container" style="height: 200px; overflow: auto;">
            <div class="loadcountContainer" style="display: none">
                loaded <span id="loadcount">0</span> meows of <span id="totalcount">0</span>
            </div>
            <div class="meows"></div>
            <div class="meowsloading"></div>
            <div class="loadMore"></div>
        </div>
    `;
}

describe('formatMeowDate', () => {
    it('formats a date for display', () => {
        const formatted = formatMeowDate('2024-06-15T12:00:00.000Z');

        expect(formatted).toMatch(/2024/);
        expect(formatted).toMatch(/June|Jun/);
    });
});

describe('createMeowElement', () => {
    it('renders meow content and author metadata', () => {
        const element = createMeowElement({
            name: 'Whiskers',
            content: 'Hello world',
            created: '2024-06-15T12:00:00.000Z'
        });

        expect(element.classList.contains('meow')).toBe(true);
        expect(element.querySelector('p').textContent).toBe('Hello world');
        expect(element.querySelector('span').textContent).toMatch(/Posted by Whiskers on/);
    });
});

describe('showError', () => {
    beforeEach(() => {
        buildDom();
    });

    it('shows and hides the form while displaying an error message', () => {
        const form = document.querySelector('form');
        const loadingElement = document.querySelector('.loading');

        loadingElement.style.display = 'block';
        form.style.display = 'none';

        const errorElement = showError('Name is required', { loadingElement, form });

        expect(loadingElement.style.display).toBe('none');
        expect(form.style.display).toBe('block');
        expect(errorElement.textContent).toBe('Name is required');
        expect(errorElement.classList.contains('error')).toBe(true);
    });

    it('does not create an error element when message is empty', () => {
        const form = document.querySelector('form');
        const loadingElement = document.querySelector('.loading');

        const errorElement = showError(undefined, { loadingElement, form });

        expect(errorElement).toBeUndefined();
        expect(document.querySelector('.error')).toBeNull();
    });
});

describe('setupClient', () => {
    beforeEach(() => {
        buildDom();
        vi.stubGlobal('alert', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('loads meows on init', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                mews: [{ name: 'Whiskers', content: 'Meow!', created: '2024-06-15T12:00:00.000Z' }],
                meta: { total: 1, has_more: false }
            })
        });
        vi.stubGlobal('fetch', fetchMock);

        setupClient(document, 'http://localhost:5000/meows');
        await vi.waitFor(() => {
            expect(document.querySelectorAll('.meow')).toHaveLength(1);
        });

        expect(document.querySelector('#loadcount').textContent).toBe('1');
        expect(document.querySelector('#totalcount').textContent).toBe('1');
    });

    it('submits a meow and refreshes the feed', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    mews: [],
                    meta: { total: 0, has_more: false }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ acknowledged: true })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    mews: [{ name: 'Whiskers', content: 'New meow', created: '2024-06-15T12:00:00.000Z' }],
                    meta: { total: 1, has_more: false }
                })
            });
        vi.stubGlobal('fetch', fetchMock);

        setupClient(document, 'http://localhost:5000/meows');
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        const form = document.querySelector('form');
        form.querySelector('[name="name"]').value = 'Whiskers';
        form.querySelector('[name="content"]').value = 'New meow';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

        expect(fetchMock.mock.calls[1][1]).toMatchObject({
            method: 'POST',
            body: JSON.stringify({ name: 'Whiskers', content: 'New meow' })
        });
        expect(document.querySelector('.meow p').textContent).toBe('New meow');
    });

    it('shows validation errors from the API', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    mews: [],
                    meta: { total: 0, has_more: false }
                })
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 422,
                json: async () => ({ message: 'Name is required' })
            });
        vi.stubGlobal('fetch', fetchMock);

        setupClient(document, 'http://localhost:5000/meows');
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        const form = document.querySelector('form');
        form.querySelector('[name="name"]').value = '';
        form.querySelector('[name="content"]').value = 'Meow';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        await vi.waitFor(() => {
            expect(document.querySelector('.error')?.textContent).toBe('Name is required');
        });
    });
});
