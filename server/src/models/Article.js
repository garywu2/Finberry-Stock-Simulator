const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
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
        default: "N/A",
    },
    firstPosted: {
        type: Date,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    // Last updated date
    dateLastUpdated: {
        type: Date,
        required: true,
        default: Date.now
    },
});

module.exports = mongoose.model("Article", articleSchema);