import express from 'express';
import fetch from 'node-fetch';
import problemsModel from '../model/problemsSchema.js';
import db from '../database/connection.js';

const router = express.Router();

router.get('/leetcode/verify/:username', async (req, res) => {
    const name = req.params.username;
    const query = `https://leetcode.com/graphql?query={matchedUser(username:\"${name}\"){activeBadge{name,icon}}}`;

    try {
        const response = await fetch(query);
        const data = await response.json();

        if (data.data.matchedUser) {
            res.send("VALID");
        } else {
            res.send("INVALID");
        }
    } catch (e) {
        console.log(e);
    }
})

// add from leetcode
router.post('/leetcode/problems/add/:username', async (req, res) => {
    const name = req.params.username;
    const collection = db.collection("Problems");
    const dataInDatabase = await collection.findOne({ Username: name});

    if (!dataInDatabase) {
        const query = `https://leetcode.com/graphql?query={matchedUser(username:\"${name}\"){username,submitStats:submitStatsGlobal{acSubmissionNum{difficulty,count}}}}`;
        const response = await fetch(query);
        const data = await response.json();
        const result = data.data.matchedUser.submitStats.acSubmissionNum;

        const newUserProblems = new problemsModel({
            Username: req.body.username,
            Easy: result[1].count,
            Medium: result[2].count,
            Hard: result[3].count
        });

        collection.insertOne(newUserProblems);
        res.send({
            "easy": result[1].count,
            "medium": result[2].count,
            "hard": result[3].count
        });
    } else {
        res.send("Username already exists in database");
    }
})

// retrieve from leetcode
router.get('/leetcode/problems/:username', async (req, res) => {
    const name = req.params.username;
    const query = `https://leetcode.com/graphql?query={matchedUser(username:\"${name}\"){username,submitStats:submitStatsGlobal{acSubmissionNum{difficulty,count}}}}`;

    const response = await fetch(query);
    const data = await response.json();

    const result = data.data.matchedUser.submitStats.acSubmissionNum;
    // 0 index is total, therefore, is omitted
    const body = {
        "easy": result[1].count,
        "medium": result[2].count,
        "hard": result[3].count
    };

    res.json(body);
})

// update from leetcode
router.put('/leetcode/problems/update/:username', async (req, res) => {
    const collection = db.collection("Problems");
    const name = req.params.username;

    const query = `https://leetcode.com/graphql?query={matchedUser(username:\"${name}\"){username,submitStats:submitStatsGlobal{acSubmissionNum{difficulty,count}}}}`;
    const response = await fetch(query);
    const data = await response.json();
    const fetchedResult = data.data.matchedUser.submitStats.acSubmissionNum;

    const findByUsername = { Username: name };
    const updateValues = { $set: { 
        Easy: parseInt(fetchedResult[1].count, 10),
        Medium: parseInt(fetchedResult[2].count, 10),
        Hard: parseInt(fetchedResult[3].count, 10)
    }};

    try {
        const dataInDB = await collection.updateOne(findByUsername, updateValues);
        res.send(dataInDB ? "success" : "fail");
    } catch (e) {
        res.send("fail");
    }
})

export default router;