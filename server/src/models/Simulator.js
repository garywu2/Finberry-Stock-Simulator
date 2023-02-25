const mongoose = require("mongoose");

const simulatorSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    stopTime: {
        type: Date,
        required: true,
    },
    userStartFund: {
        type: Number,
        required: true,
      },
    hidden: {
        type: Boolean,
        required: true,
        default: false
    },
    simulatorEnrollments: {
        type: [{ type: mongoose.SchemaTypes.ObjectID, ref: "SimulatorEnrollment" }],
        required: true,
        default: []
    },

    // Last updated date
    dateLastUpdated: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("Simulator", simulatorSchema);