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
        unique: true
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
    phoneNumber: {
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
        type: String,
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
    premiumExpiryDate: {
        type: Date,
        required: false,
        default: null,
    },
    privacySettings: { // True = Visible
        // coachingProfile: { // Doing this another way, via Putting CoachingProfile not here
        //     type: Boolean,
        //     required: true,
        //     default: true
        // },
        personalProfile: {
            type: Boolean,
            required: true,
            default: true
        },
        simulator: {
            type: Boolean,
            required: true,
            default: true
        },
        leaderboard: {
            type: Boolean,
            required: true,
            default: true
        },
        badges: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    simulatorEnrollments: { // Does not dirrectly link to the simulator, it links to a proxy class called SimulatorEnrollment
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "SimulatorEnrollment" }],
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
    // A user may now have a list of coaching profiles.
    coachingProfiles: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "CoachingProfile" }],
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