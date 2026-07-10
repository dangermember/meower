import express from 'express';
import cors from 'cors';
import monk from 'monk';
import { Filter } from 'bad-words';
import rateLimit from 'express-rate-limit';

const app = express();

const db = monk('localhost/meower');
const mews = db.get('mews');
const filter = new Filter();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true // Only if you're using cookies or authentication
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: "meower 😺"
    })
});

function isValidData(data) {
    return data && data.toString().trim() !== '';
}
app.get('/meows', (req, res) => {
    mews.find().then((mews) => {
        res.json(mews);
    })

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
    mews.insert(meow).then((createdMeow) => {
        res.json(createdMeow);
    })
})

app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
})