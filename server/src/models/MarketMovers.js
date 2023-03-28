const mongoose = require("mongoose");

const marketMoverSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    exchange: {
        type: String,
        required: true,
    },
    datetime: {
        type: String,
        required: true,
    },
    last: {
        type: Number,
        required: true,
    },
    high: {
        type: Number,
        required: true,
    },
    low: {
        type: Number,
        required: true,
    },
    volume: {
        type: Number,
        required: true,
    },
    change: {
        type: Number,
        required: true,
    },
    percent_change: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("MarketMovers", marketMoverSchema);