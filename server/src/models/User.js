const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    preferredName: {
        type: String,
        required: true,
      },
    dateOfBirth: {
        type: Date,
        required: false,
    },
    permissionLevel: {
        type: Number,
        required: true,
    },
    cratedAt: {
        type: Date,
        required: true,
    },
    coachingProfile: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "CoachingProfile" },
        required: false,
    },
    avatar: {
        data: String,
        required: false,
    },
    theme: {
        type: String,
        required: true,
    },
    payerID: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
    },
    location: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false
    },
    privacySettings: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "PrivacySetting" },
        required: true,
    },
    dateLastUpdated: {
        type: Date,
        required: true
    },
    isPremium: {
        type: Boolean,
        required: true,
        default: false
    },
    premiumExpiryDate: {
        type: Date,
        required: false
    },
    participatingSimulator: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Simulator" }],
        required: true,
        default: []
    },
    badges: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "UserBadges" }],
        required: true,
        default: []
    },
    coaches: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Coaches" }],
        required: true,
        default: []
    },
    premiumPaymentHistory: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "PremiumPaymentHistory" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("User", userSchema);