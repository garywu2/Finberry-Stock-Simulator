const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    coachingSession: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingSession",
        required: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    timeSend: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);