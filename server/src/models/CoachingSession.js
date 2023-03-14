const mongoose = require("mongoose");

const coachingSessionSchema = new mongoose.Schema({
    coachingCoach: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingCoach",
        required: true,
    },
    coachingClient: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingClient",
        required: true,
    },
    coach: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    client: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    requestedTime: { // When session is first requested by client
        type: Date,
        required: true,
    },
    startTime: { // When session is first formally accepted by coach.
        type: Date,
        required: true,
    },
    endTime: { // When session is finally terminated
        type: Date,
        required: true,
    },
    autoTerminationTime: { // When session is automatically terminated
        type: Date,
        required: true,
    },
    active: {
        type: Date,
        required: true,
    },
    
    paymentHistory: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "PaymentHistory"} ],
        required: true,
        default: []
    },
    chatMessages: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "ChatMessage"} ],
        require: true,
        default: []
    }
});

module.exports = mongoose.model("CoachingSession", coachingSessionSchema);