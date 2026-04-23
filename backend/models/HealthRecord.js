const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    icon: { type: String, default: "pill" }
}, { _id: false });

const healthRecordSchema = new mongoose.Schema({
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
    recordType: {
        type: String,
        enum: ["medical", "vaccination", "weight"],
        default: "medical"
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "resolved"],
        default: "active"
    },
    visitDate: {
        type: Date,
        default: Date.now
    },
    clinicName: {
        type: String,
        trim: true
    },
    vetName: {
        type: String,
        trim: true
    },
    vetTitle: {
        type: String,
        trim: true
    },
    diagnosis: {
        type: String,
        trim: true
    },
    treatment: [{
        type: String,
        trim: true
    }],
    medicines: [medicineSchema],
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
healthRecordSchema.index({ petId: 1, userId: 1 });
healthRecordSchema.index({ petId: 1, recordType: 1 });

module.exports = mongoose.model("HealthRecord", healthRecordSchema, "HealthRecords");
