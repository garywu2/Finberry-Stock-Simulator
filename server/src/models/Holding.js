const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
    simulatorEnrollment: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "SimulatorEnrollment",
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    index: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    averagePurchasePrice: {
        type: Number,
        required: true,
        default: 0,
    },
});

module.exports = mongoose.model("Holding", holdingSchema);