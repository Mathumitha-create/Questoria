import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    atsScore: { type: Number, default: 0 },
    skillsFound: { type: [String], default: [] },
    skillsMissing: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    rawResult: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const ResumeAnalysis = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema,
);
