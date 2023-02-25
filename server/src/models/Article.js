const mongoose = require("mongoose");

// BUG: It appears theres some issues with making title Unique. Need to be investigated.
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    externalLink: {
        type: String,
        required: false,
    },
    firstPosted: {
        type: Date,
        required: true,
    },

    // Last updated date
    dateLastUpdated: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("Article", articleSchema);