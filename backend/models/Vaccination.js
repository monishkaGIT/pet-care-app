const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vaccineName: {
        type: String,
        required: true,
        trim: true
    },
    lotNumber: {
        type: String,
        trim: true
    },
    administeredDate: {
        type: Date,
        required: true
    },
    nextDueDate: {
        type: Date
    },
    administeredBy: {
        type: String,
        trim: true
    },
    clinicName: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
vaccinationSchema.index({ petId: 1, userId: 1 });
vaccinationSchema.index({ petId: 1, nextDueDate: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema, "Vaccinations");
