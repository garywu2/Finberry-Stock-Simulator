const mongoose = require("mongoose");

const simulatorEnrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    simulator: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "Simulator",
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    lastCalculatedTotal: {
        type: Number,
        required: false,
    },
    lastCalculatedTotalDate: {
        type: Date,
        required: false,
    },
    lastCalculatedRanking: {
        type: Number,
        required: true,
        default: -1
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
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "TradeTransaction" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("SimulatorEnrollment", simulatorEnrollmentSchema);