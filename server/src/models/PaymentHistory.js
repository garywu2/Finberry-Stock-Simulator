const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
    referenceNumber: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentReason: {
        type: String,
        required: true,
        default: "Unspecified",
    },
    payeeID: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        // required: true, // No longer required, as we can also accept payment for premium user
    },
    payerID: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    transferAmount: {
        type: Number,
        required: true,
    },
    transactionDate: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);