import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "cpp", "java"],
      required: true,
    },
    sourceCode: { type: String, required: true },
    status: { type: String, default: "Pending" },
    runtime: { type: String, default: "" },
    memory: { type: String, default: "" },
    output: { type: String, default: "" },
    passed: { type: Boolean, default: false },
    attempts: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const Submission = mongoose.model("Submission", submissionSchema);
