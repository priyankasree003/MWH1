require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./routes/auth');
const sentiment = require('./routes/sentiment');
const feedback = require('./routes/feedback');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/sentiment', sentiment);
app.use('/api/feedback', feedback);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Backend listening on', port));
