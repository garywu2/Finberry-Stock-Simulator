const mongoose = require("mongoose");

const coachingProfileSchema = new mongoose.Schema({
    // userEmail: {
    //     type: String,
    //     required: true, 
    // },
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        required: true, 
    },
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
        default: Date.now,
    },
    requestJustification: {
        type: String,
        required: false,
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