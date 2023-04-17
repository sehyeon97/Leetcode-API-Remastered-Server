import express from 'express';
import joi from 'joi';
import badgesModel from '../model/badgesSchema.js';
import db from '../database/connection.js';

const router = express.Router();
const schema = joi.object({
    username: joi.string().min(4).max(16).required(),
    badges: joi.array().items(joi.string()).required()
})

const removeDuplicates = (currBadges, newBadges) => {
    let uniqueBadges = new Set();
    let badges = [];

    for (let badge of currBadges) {
        if (!uniqueBadges.has(badge)) {
            uniqueBadges.add(badge);
            badges.push(badge);
        }
    }

    for (let badge of newBadges) {
        if (!uniqueBadges.has(badge)) {
            uniqueBadges.add(badge);
            badges.push(badge);
        }
    }

    return badges;
}

// Create
router.post('/badges', async (req, res) => {
    const collection = db.collection("Badges");
    const validation = schema.validate(req.body);
    if (validation.error) {
        res.status(400).send(validation.error);
    }

    const newUserBadges = new badgesModel({
        Username: req.body.username,
        Badges: req.body.badges
    });

    const result = await collection.insertOne(newUserBadges);
    if (result.acknowledged) {
        res.send("Document successfully inserted into Badges Collection");
    } else {
        res.send("Document insertion failed");
    }
})

// Retrieve
router.get('/badges/:username', async (req, res) => {
    const collection = db.collection("Badges");
    const findByUsername = { Username: req.params.username };
    const result = await collection.findOne(findByUsername);

    if (!result) {
        res.send("Failed to fetch results with that username.");
    } else {
        const badges = result.Badges;
        res.send(badges);
    }
})

// Update
router.put('/badges/:username', async (req, res) => {
    const collection = db.collection("Badges");
    const findByUsername = { Username: req.params.username };
    const result = await collection.findOne(findByUsername);

    let currBadges = result.Badges;
    let newBadges = req.body.badges;

    let badges = { $set: { Badges: removeDuplicates(currBadges, newBadges) }};

    const updatedResult = await collection.updateOne(findByUsername, badges);
    res.send(`${updatedResult.matchedCount} document(s) matched the filter, updated ${updatedResult.modifiedCount} document(s)`);
})

// Delete
router.delete('/badges/:username', async (req, res) => {
    const collection = db.collection("Badges");
    const findByUsername = { Username: req.params.username };
    const result = await collection.deleteOne(findByUsername);

    if (result.deletedCount === 1) {
        res.send("Successfully deleted one document.");
    } else {
        res.send("No documents matched the username. Deletion failed.");
    }
})

export default router;