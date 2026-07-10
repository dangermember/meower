import 'dotenv/config';
import { createApp } from './app.js';

const port = process.env.PORT || 5000;

const { app } = await createApp();

app.listen(port, () => {
    console.log('Listening on http://localhost:' + port);
});
