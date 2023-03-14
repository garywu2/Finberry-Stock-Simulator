const mongoose = require("mongoose");

const coachingCoachSchema = new mongoose.Schema({
    ownerUser: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    coach: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    firstInteraction: { // First time the client tried to request an session. (Coach does not need to accept)
        type: Date,
        required: true,
    },
    latestSessionInteraction: { // Occurs when the coach accepts an session, or a session closes.
        type: Date,
        required: true,
    },
    note: {
        type: String,
        required: false,
    },
    coachingSessions: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "CoachingSession" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("CoachingCoach", coachingCoachSchema);