const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { // Each user is unique (From firebase)
        type: String,
        required: true,
        unique: true
    },
    username: {
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
        required: false,
    },
    dateOfBirth: {
        type: Date,
        required: false,
    },
    permissionLevel: { // Let 0 be base permission, 1 be moderator, 2 be administrator, and 3 be master authority 
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    // Below are user profile changes
    avatar: {
        data: String,
        required: false,
        default: "", // Image link: OUR DB like league avatar
    },
    theme: {
        type: Number,
        required: true,
        default: 0, // Number coded: 0 = default, etc
    },
    // payerID: { // Wait why is there a payer id to the profile???
    //     type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
    //     required: true,
    //     default: []
    // },
    location: {
        type: String,
        required: true,
        default: " ", // Location, technically not required but we can have empty location for simplicity
    },
    bio: {
        type: String,
        required: true,
        default: " ", // User bio, technically not required but we can have empty location for simplicity
    },
    privacySettings: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "PrivacySetting" },
        required: false, // Object ID CANNOT have required == true
    },
    // isPremium: { // No need here, we should determine this based on premium expiry date
    //     type: Boolean,
    //     required: true,
    //     default: false,
    // },
    premiumExpiryDate: {
        type: Date,
        required: false,
        default: null,
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

    // Below are coaching profile
    // coachingProfile: {
    //     type: { type: mongoose.SchemaTypes.ObjectID, ref: "CoachingProfile" },
    //     required: false, // Object ID CANNOT have required == true
    // },
    coachingProfiles: {
        type: [
            {
                coachingProfile: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "CoachingProfile"
                },
                status: { // 0 - Pending (Requested), 1 - Active, 2 - Coach decided to hide or cancel coaching profile, 3 - Moderator/admin suspended
                    type: Number,
                    required: true,
                },
                // Last updated date
                dateLastUpdated: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
            }
        ],
        required: true,
        default: []
    },

    // Last updated date
    dateLastUpdated: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);