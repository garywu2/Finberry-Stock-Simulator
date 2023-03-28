const mongoose = require("mongoose");

const coachingClientSchema = new mongoose.Schema({
    ownerCoachingProfile: { 
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingProfile",
        required: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    note: {
        type: String,
        required: false,
    },
    blocked: { // Coach may edit the coaching client profile of any of their clients and
        // Choose to add a note, or block them at will.
        type: Boolean,
        required: true,
    },
    firstInteraction: { // First time the client requests a session from the coach.
        type: Date,
        required: true,
    },
    latestSessionInteraction: { // Occurs when the coach accepts an session, or a session closes. (So no need to have input from client)
        type: Date,
        required: true,
    },
    coachingSessions: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "CoachingSession" }],
        required: true,
        default: []
    }
});

module.exports = mongoose.model("CoachingClient", coachingClientSchema);