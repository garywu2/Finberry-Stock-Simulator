const mongoose = require("mongoose");

const userBadgeSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    badgeType: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "Badge",
        required: true,
    },
    retracted: {
        data: Boolean,
        required: true,
        default: false
    },
    displayPosition: {
        type: Number,
        required: true,
    },
    dateEarned: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("UserBadge", userBadgeSchema);