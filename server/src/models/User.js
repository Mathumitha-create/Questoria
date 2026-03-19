import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String },
    profilePhoto: { type: String, default: "" },
    points: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
    xpPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    levelTitle: { type: String, default: "Beginner" },
    badges: { type: [String], default: [] },
    rank: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    weeklyCycleStart: { type: Date, default: null },
    lastActiveAt: { type: Date, default: null },
    dailyLogins: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    contestRating: { type: Number, default: 1200 },
    bio: { type: String, default: "" },
    college: { type: String, default: "" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    resetToken: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    oauthProvider: {
      type: String,
      enum: ["none", "firebase-google"],
      default: "none",
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
