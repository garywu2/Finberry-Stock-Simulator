const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Holding", holdingSchema);