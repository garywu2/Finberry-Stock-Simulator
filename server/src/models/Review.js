const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    coach: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
    },
    user: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: false,
    },
    spendMoney: {
        type: Boolean,
        required: false,
        default: false
    },
    reviewed: {
        type: Boolean,
        required: true,
        default: false
    },
    modRemoved: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = mongoose.model("Review", reviewSchema);