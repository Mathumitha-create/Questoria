import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    hidden: { type: Boolean, default: true },
  },
  { _id: false },
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    tags: { type: [String], default: [] },
    companies: { type: [String], default: [] },
    acceptanceRate: { type: Number, default: 0 },
    description: { type: String, required: true },
    examples: { type: [mongoose.Schema.Types.Mixed], default: [] },
    constraints: { type: [String], default: [] },
    hints: { type: [String], default: [] },
    editorial: { type: String, default: "" },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      cpp: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    testCases: { type: [testCaseSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Problem = mongoose.model("Problem", problemSchema);
