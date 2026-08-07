const mongoose = require("mongoose");

// A symbol a user is watching. Kept deliberately thin — the stock page and the
// Simulator's watchlist card only need the ticker; prices are fetched live.
//
// SECURITY: unauthenticated like the rest of this server today. The acting user
// comes from the request, not a verified token, until Phase 3 adds
// verifyIdToken middleware. See docs/audit/backend-audit.md.
const watchlistEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    // Exchange is stored so trades placed from a watched symbol do not need a
    // second lookup; "N/A" when it could not be resolved.
    index: {
        type: String,
        required: false,
        default: "N/A",
    },
    addedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// A user watches a symbol at most once.
watchlistEntrySchema.index({ user: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model("WatchlistEntry", watchlistEntrySchema);
