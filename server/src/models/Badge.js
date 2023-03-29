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
    rarity: { // 0 - Common, 1 - Uncommon, 2 - Rare, 3 - Epic, 4 - Legendary, 5 - Mythic, 6 - Exotic
        type: Number,
        required: true,
        default: 0,
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