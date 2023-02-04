const mongoose = require("mongoose");

const coachingProfileSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    image: {
        data: String,
        required: false,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    status: {
        type: Number,
        required: true,
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