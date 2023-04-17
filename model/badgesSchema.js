import mongoose from 'mongoose';

const BadgesSchema = new mongoose.Schema({
    Username: {
        type: String,
        unique: true
    },
    Badges: [{ type: String }]
});

export default mongoose.model("badges", BadgesSchema, "Badges");