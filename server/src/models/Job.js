const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    technician: {
      id: {
        type: String,
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },

    product: {
      type: String,
      required: true,
      trim: true,
    },

    reportedIssue: {
      type: String,
      required: true,
      trim: true,
    },

    workPerformed: {
      type: String,
      default: null,
    },

    recommendation: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      min: 0,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "AWAITING_VERIFICATION",
        "APPROVED",
        "DISPUTED",
      ],
      default: "ASSIGNED",
      required: true,
    },

    verificationToken: {
      type: String,
      default: null,
      index: true,
    },

    disputeReason: {
      type: String,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);