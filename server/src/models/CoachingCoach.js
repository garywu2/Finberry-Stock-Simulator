const mongoose = require("mongoose");

// Notice here that it doesnt care about the coachingProfile but the
// coach itself.
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
    note: {
        type: String,
        required: false,
    },
    firstInteraction: { // First time the client tried to request an session. (Coach does not need to accept)
        type: Date,
        required: true,
    },
    latestSessionInteraction: { // Occurs when the coach accepts an session, or a session closes.
        type: Date,
        required: true,
    },
    
    coachingSessions: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "CoachingSession" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("CoachingCoach", coachingCoachSchema);