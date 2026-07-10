const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true // Only if you're using cookies or authentication
}));
app.use(express.json());
app.get('/',(req,res)=>{
    res.json({
        message:"meower 😺"
    })
});

app.post('/meows',(req,res)=>{
    console.log(req.body);
})

app.listen(5000,()=>{
    console.log('Listening on http://localhost:5000');
})