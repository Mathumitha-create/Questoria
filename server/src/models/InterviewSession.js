import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    prompt: { type: String, required: true },
    type: {
      type: String,
      enum: ["coding", "hr", "system-design"],
      required: true,
    },
    expectedFocus: { type: [String], default: [] },
    starterCode: { type: String, default: "" },
  },
  { _id: false },
);

const interviewAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answerText: { type: String, default: "" },
    code: { type: String, default: "" },
    language: { type: String, default: "javascript" },
    score: { type: Number, default: 0 },
    feedback: {
      correctness: { type: String, default: "" },
      clarity: { type: String, default: "" },
      optimization: { type: String, default: "" },
      communication: { type: String, default: "" },
      overall: { type: String, default: "" },
      improvements: { type: [String], default: [] },
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["dsa", "hr", "system-design"],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
      index: true,
    },
    questions: { type: [interviewQuestionSchema], default: [] },
    answers: { type: [interviewAnswerSchema], default: [] },
    currentQuestionIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

export const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema,
);
