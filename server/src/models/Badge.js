const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        data: String,
        required: true,
    },
    enabled: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = mongoose.model("Badge", badgeSchema);