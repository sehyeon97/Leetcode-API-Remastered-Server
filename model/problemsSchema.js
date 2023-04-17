import mongoose from 'mongoose';

const ProblemsSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true
    },
    Easy: Number,
    Medium: Number,
    Hard: Number
});

export default mongoose.model("Problems", ProblemsSchema);