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
    },
    firstPosted: {
        type: Date,
        required: true,
    },
    lastUpdate: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("Article", articleSchema);