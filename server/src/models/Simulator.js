const mongoose = require("mongoose");

const simulatorSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    stopTime: {
        type: Date,
        required: true,
    },
    userStartFund: {
        type: Number,
        required: true,
      },
    hidden: {
        type: Boolean,
        required: true,
        default: false
    },
    participatingUsers: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("Simulator", simulatorSchema);