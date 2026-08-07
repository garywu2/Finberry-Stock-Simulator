const mongoose = require("mongoose");

// Per-user progress through a lesson.
//
// SECURITY: like every other endpoint on this server today, the progress
// routes are unauthenticated — the acting user is taken from the request, not
// from a verified token, so progress is forgeable until Phase 3 adds
// verifyIdToken middleware. See docs/audit/backend-audit.md.
const lessonProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    lesson: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "Lesson",
        required: true,
    },
    // 0-100. 100 implies completed.
    percentComplete: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100,
    },
    completedAt: {
        type: Date,
        required: false,
        default: null,
    },
    lastViewedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// One progress record per user per lesson.
lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("LessonProgress", lessonProgressSchema);
