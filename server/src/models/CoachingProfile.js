const mongoose = require("mongoose");

const coachingProfileSchema = new mongoose.Schema({
    userEmail: { // The user owning this coaching profile.
        type: String,
        required: false, // Cant be set to required - mongoDB wont allow string to be required
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: false, // Cant be set to required - mongoDB wont allow string to be required
    },
    image: {
        data: String,
        required: false, // Cant be set to required - mongoDB wont allow string to be required
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    requestJustification: {
        data: String,
        required: false, // Cant be set to required - mongoDB wont allow string to be required
    },
    requestResponse: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        auditorUsername: {type: String, default: "Not Yet Reviewed"},
        required: false,
    },
    reviews: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Review" }],
        required: true,
        default: []
    },
    clients: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Client" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("CoachingProfile", coachingProfileSchema);