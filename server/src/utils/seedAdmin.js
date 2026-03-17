import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@questoria.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = await User.findOne({ email: adminEmail });
  if (existing) return;

  const password = await bcrypt.hash(adminPassword, 10);

  await User.create({
    username: "Questoria Admin",
    email: adminEmail,
    password,
    role: "admin",
    level: 100,
    xpPoints: 999999,
    badges: ["Founding Admin"],
    streak: 999,
    problemsSolved: 9999,
    contestRating: 3500,
  });

  // eslint-disable-next-line no-console
  console.log("✅ Admin account seeded");
}
