import express from 'express';
import cors from "cors";
import parser from 'body-parser';
import dot from 'dotenv';

import problemsRoute from './routes/problems.js';
import badgesRoute from './routes/badges.js';
import leetcodeRoute from './routes/leetcode.js';

const app = express();
const process = dot.config().parsed;

// middleware to allow ALL access from other clients (browsers) to this application
// This allows resource sharing between browsers
// However it does not directly prevent cors attacks
app.use(cors());

// body parsing middleware
// This will allow the app to collect the request's body in json format. Without this, it won't be able to encode the request's body data
app.use(parser.urlencoded({extended: true}));
app.use(parser.json());

app.get('/', (req, res) => {
    res.send('Rest API created using NodeJS and Express');
});

app.use(problemsRoute);
app.use(badgesRoute);
app.use(leetcodeRoute);

app.listen(process.PORT, () => console.log('Listening on port 4000'));