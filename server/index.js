import express from 'express';
import cors from 'cors';
import monk from 'monk';
import { Filter } from 'bad-words';

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

function isValidMeow(meow) {
    return meow.name && meow.name.toString().trim() !== '' &&
        meow.content && meow.content.toString().trim() !== '';
}
app.get('/meows', (req, res) => {
    mews.find().then((mews) => {
        res.json(mews);
    })

});

app.post('/meows', (req, res) => {
    if (isValidMeow(req.body)) {
        const meow = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        }
        mews.insert(meow).then((createdMeow) => {
            res.json(createdMeow);
        })
    } else {
        res.status(422).json({
            message: "Invalid meow data"
        });
    }
    console.log(req.body);
})

app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
})