const mongoose = require("mongoose");

const privacySettingSchema = new mongoose.Schema({
    coachingProfile: {
        type: Boolean,
        required: true,
    },
    personalProfile: {
        type: Boolean,
        required: true,
    },
    simulator: {
        type: Boolean,
        required: true,
    },
    leaderboard: {
        type: Boolean,
        required: true,
    },
    badges: {
        type: Boolean,
        required: true
    },
});

module.exports = mongoose.model("PrivacySetting", privacySettingSchema);