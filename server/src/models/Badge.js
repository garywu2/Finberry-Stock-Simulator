const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    enabled: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = mongoose.model("Badge", badgeSchema);