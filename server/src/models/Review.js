const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    coachingProfile: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingProfile",
        required: true,
    },
    coach: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    createdAt: {
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
    requireReview: {
        type: Boolean,
        required: true,
        default: false
    },
    modRemoved: {
        type: Boolean,
        required: true,
        default: false,
    },
    userEdited: {
        type: Boolean,
        required: true,
        default: false,
    },

    // Last updated date
    dateLastUpdated: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("Review", reviewSchema);