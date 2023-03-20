const mongoose = require("mongoose");

const coachingSessionSchema = new mongoose.Schema({
    coachingCoach: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingCoach",
        required: true,
    },
    coachingClient: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingClient",
        required: true,
    },
    coachingProfile: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "CoachingProfile",
        required: true,
    },
    coach: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    client: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    requestedTime: { // When session is first requested by client
        type: Date,
        required: true,
    },
    startTime: { // When session is first formally accepted by coach.
        type: Date,
        required: false,
    },
    endTime: { // When session is finally terminated (TO BE IMPLEMENTED)
        type: Date,
        required: false,
    },
    autoTerminationTime: { // When session is automatically terminated (TO BE IMPLEMENTED)
        type: Date,
        required: false,
    },
    status: { // 0 - Pending (Requested), 1 - Active,
        // 2 - Session sucessfully completed (Also made payment if agreed price is not 0),
        // 3 - Session Declined by coach and never became active,
        // 4 - Session Cancelled by User before active,
        // 5 - In progress session cancelled by coach.
        // 6 - In progress session cancelled by user.
        type: Number,
        required: true,
        default: 0,
    },
    agreedPayment: { 
        type: Number,
        required: true,
    },
    clientRequestNote: {
        type: String,
        required: false,
    },
    sessionTerminationReason: {
        type: String,
        required: false,
    },
    
    paymentHistory: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "PaymentHistory",
        required: false,
    },

    chatMessages: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "ChatMessage"} ],
        require: true,
        default: []
    }
});

module.exports = mongoose.model("CoachingSession", coachingSessionSchema);