const mongoose = require("mongoose");

const userBadgesSchema = new mongoose.Schema({
    userBadgeID: {
        type: Number,
        required: true,
    },
    description: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "Badge" },
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

module.exports = mongoose.model("UserBadges", userBadgesSchema);