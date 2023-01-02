const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
    referenceNumber: {
        type: String,
        required: true,
    },
    payeeID: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
    },
    payerID: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "User" }],
        required: true,
    },
    trasnferAmount: {
        type: Number,
        required: true,
    },
    transactionDate: {
        type: Date,
        required: true
    },
});

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);