const mongoose = require("mongoose");

const tradeTransactionSchema = new mongoose.Schema({
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
    transactionType: { // 1 - Buy, 2 - Sell, 
        type: Number,
        required: true,
    },
    transactionTime: {
        type: Date,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("TradeTransaction", tradeTransactionSchema);