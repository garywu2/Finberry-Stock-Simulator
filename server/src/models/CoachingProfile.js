const mongoose = require("mongoose");

const coachingProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true, 
    },
    status: { // 0 - Pending (Requested), 1 - Active, 2 - Coach decided to hide coaching profile, 3 - Disproved (Moderator did not approve of the prospecting coach) , 4 - Coach decided to deactivate or DELETE profile (But we keep a copy), 5 - Moderator/admin suspended
        type: Number,
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
        requestResponse: {type: String, default: "Not Yet Reviewed"},
        auditorUsername: {type: String, default: "Not Yet Reviewed"},
        required: false,
    },
    terminationReason: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        terminationJustification: {type: String, default: "NA"},
        terminatorUsername: {type: String, default: "Not Terminated"},
        required: false,
    },

    // Last updated date
    dateLastUpdated: {
        type: Date,
        required: true,
        default: Date.now,
    },

    // Perhaps we do not even need a list here. As the coaching profile already have a reference to know where this is. (Maybe we can consider removing this later)
    reviews: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "Review" }],
        required: true,
        default: []
    },
    coachingClients: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "CoachingClient" }],
        required: true,
        default: []
    },
});

module.exports = mongoose.model("CoachingProfile", coachingProfileSchema);