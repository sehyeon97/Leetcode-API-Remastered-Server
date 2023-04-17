import express from 'express';
// middleware to easily validate request body with database schema
import joi from 'joi';
import problemsModel from '../model/problemsSchema.js';
import db from '../database/connection.js';

const router = express.Router();
const schema = joi.object({
    username: joi.string().min(4).max(16).required(),
    easy: joi.number().required(),
    medium: joi.number().required(),
    hard: joi.number().required()
});

// Create
router.post("/problems", async (req, res) => {
    const collection = db.collection("Problems");

    let results = await collection.findOne({ Username: req.body.username});
    if (!results) {
        const validation = schema.validate(req.body);
        if (validation.error) {
            res.status(400).send(validation.error);
        }

        const newUserProblems = new problemsModel({
            Username: req.body.username,
            Easy: req.body.easy,
            Medium: req.body.medium,
            Hard: req.body.hard
        });

        collection.insertOne(newUserProblems);
        res.send("Data inserted successfully");
    } else {
        res.send("Username already exists");
    }
});

// Retrieve
router.get("/problems/:username", async (req, res) => {
    const collection = db.collection("Problems");
    let results = await collection.findOne({ Username: req.params.username});

    res.json(results);
});

// Update
router.put("/problems/:username", async (req, res) => {
    const collection = db.collection("Problems");
    const validation = schema.validate(req.body);
    if (validation.error) {
        res.send(validation.error);
    }

    const findByUsername = { Username: req.params.username };
    const updateValues = { $set: { 
        Easy: req.body.easy,
        Medium: req.body.medium,
        Hard: req.body.hard
    }};

    const result = await collection.updateOne(findByUsername, updateValues);
    // res.send(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
    res.send("Success");
});

// Delete
router.delete('/problems/:username', async (req, res) => {
    const collection = db.collection("Problems");
    const findByUsername = { Username: req.params.username };
    const result = await collection.deleteOne(findByUsername);

    if (result.deletedCount === 1) {
        res.send("Successfully deleted one document.");
    } else {
        res.send("No documents matched the username. Deletion failed.");
    }
})

export default router;