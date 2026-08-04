const mongoose = require("mongoose");

// A directed follow edge: `follower` follows `following`.
//
// SECURITY: unauthenticated like the rest of this server today — the acting
// user comes from the request rather than a verified token, so follows are
// forgeable until Phase 3 adds verifyIdToken middleware.
// See docs/audit/backend-audit.md.
const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    following: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// One edge per ordered pair.
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);
