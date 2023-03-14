const mongoose = require("mongoose");

const coachingSessionSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    active: {
        type: Date,
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
    paymentHistory: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "PaymentHistory"} ],
        required: true,
        default: []
    },
    chatLogs: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "ChatLog"} ],
        require: true,
        default: []
    }
});

module.exports = mongoose.model("CoachingSession", coachingSessionSchema);