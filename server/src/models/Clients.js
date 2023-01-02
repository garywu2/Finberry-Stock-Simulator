const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    user: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "User" },
        required: true,
    },
    shortNote: {
        type: String,
        required: false,
    },
    clientRequestNote: {
        data: String,
        required: false,
    },
    approvedStatus: {
        type: Boolean,
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
    sessions: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Session" }],
        required: true,
        default: []
    }
});

module.exports = mongoose.model("Client", clientSchema);