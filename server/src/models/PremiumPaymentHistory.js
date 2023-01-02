const mongoose = require("mongoose");

const premiumPaymentHistorySchema = new mongoose.Schema({
    paymentHistory: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "PaymentHistory" }],
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true
    },
});

module.exports = mongoose.model("PremiumPaymentHistory", premiumPaymentHistorySchema);