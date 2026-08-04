const mongoose = require("mongoose");

// Lessons replace the old flat Article model: same authored content, plus the
// category / ordering / duration the Learn hub needs. Articles were migrated
// into lessons (see scripts/migrateArticlesToLessons.js).
const LESSON_CATEGORIES = [
    "Basics",
    "Markets",
    "Strategy",
    "Risk",
    "Crypto",
    "Retirement",
];

const lessonSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
        enum: LESSON_CATEGORIES,
        default: "Basics",
    },
    // Lessons that belong to a guided path share a pathKey and are ordered by
    // `order`. Standalone lessons leave pathKey null.
    pathKey: {
        type: String,
        required: false,
        default: null,
    },
    order: {
        type: Number,
        required: true,
        default: 0,
    },
    // Reading time in minutes. Estimated from the body at write time so clients
    // do not each recompute it.
    estimatedMinutes: {
        type: Number,
        required: true,
        default: 5,
    },
    externalLink: {
        type: String,
        required: false,
        default: "N/A",
    },
    author: {
        type: String,
        required: true,
    },
    published: {
        type: Boolean,
        required: true,
        default: true,
    },
    firstPosted: {
        type: Date,
        required: true,
        default: Date.now,
    },
    dateLastUpdated: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("Lesson", lessonSchema);
module.exports.CATEGORIES = LESSON_CATEGORIES;
