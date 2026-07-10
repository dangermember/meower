import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { Filter } from 'bad-words';
import rateLimit from 'express-rate-limit';

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/meower';
const clientUri = process.env.CLIENT_URI || 'http://localhost:3000';
const version = process.env.VERSION || '1.0.0';

const app = express();
app.disable('x-powered-by');

const client = new MongoClient(mongoUri);
const db = client.db();
const mews = db.collection('mews');
const filter = new Filter();

app.use(cors({
    origin: clientUri,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: "meower 😺 " + version
    })
});

function isValidData(data) {
    return data && data.toString().trim() !== '';
}
app.get('/meows', (req, res) => {
    mews.find().toArray().then((list) => {
        console.log(list);
        res.json(list);
    });
});

app.use(rateLimit({
    windowMs: 3 * 1000, // 30 seconds
    max: 1, // limit each IP to 1 request per windowMs
    message: "Too many requests from this IP, please try again after 30 seconds"
}));

app.post('/meows', (req, res) => {
    const name = req.body.name.toString();
    const content = req.body.content.toString();
    if (!isValidData(name)) {
        res.status(422).json({
            message: "Name is required"
        });
        return;
    }
    if (!isValidData(content)) {
        res.status(422).json({
            message: "Content is required"
        });
        return;
    }
    const meow = {
        name: filter.clean(name),
        content: filter.clean(content),
        created: new Date()
    }
    mews.insertOne(meow).then((createdMeow) => {
        res.json(createdMeow);
    })
})

app.listen(port, () => {
    console.log('Listening on http://localhost:' + port);
})