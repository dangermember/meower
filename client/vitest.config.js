export default {
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary', 'html'],
            include: ['client.js'],
            exclude: ['test/**']
        }
    }
};
