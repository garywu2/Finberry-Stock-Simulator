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
    profile: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "Profile" },
        required: true,
    },
    coachingProfile: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "CoachingProfile" },
        required: false,
    },
});

module.exports = mongoose.model("User", userSchema);