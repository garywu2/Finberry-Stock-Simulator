const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema({
    user: {
        type: { type: mongoose.SchemaTypes.ObjectID, ref: "User" },
        required: true,
    },
    timeSend: {
        type: Date,
        required: true,
    },
    message: {
        data: String,
        required: true,
    },
});

module.exports = mongoose.model("ChatLog", chatLogSchema);