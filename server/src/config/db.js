import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  // eslint-disable-next-line no-console
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
}
