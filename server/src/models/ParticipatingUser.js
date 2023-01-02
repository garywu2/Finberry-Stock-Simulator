const mongoose = require("mongoose");

const participatingUserSchema = new mongoose.Schema({
    user: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    joinDate: {
        type: Date,
        required: true,
    },
    holdings: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Holding" }],
        required: true,
        default: []
    },
    tradeHistory: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "TradeHistory" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("ParticipatingUser", participatingUserSchema);