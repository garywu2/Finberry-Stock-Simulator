const mongoose = require("mongoose");

const tradeHistorySchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
    },
    index: {
        type: String,
        required: true,
    },
    transactionType: {
        type: String,
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

module.exports = mongoose.model("TradeHistory", tradeHistorySchema);