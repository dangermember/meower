export default {
    test: {
        environment: 'node',
        fileParallelism: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary', 'html'],
            include: ['app.js'],
            exclude: ['test/**', 'index.js']
        }
    }
};
