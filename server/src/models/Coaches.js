const mongoose = require("mongoose");

const coachesSchema = new mongoose.Schema({
    coach: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "User" },
        required: true,
    },
    firstInteraction: {
        type: Date,
        required: true,
    },
    lastInteraction: {
        type: Date,
        required: true,
    },
    note: {
        type: String,
        required: false,
    },
    sessions: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Sessions" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("Coaches", coachesSchema);