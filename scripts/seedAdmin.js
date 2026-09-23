require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const ADMIN_NAME = process.env.ADMIN_SEED_NAME || "Super Admin";
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || "admin@indexiafinance.com";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "Admin@123";

const run = async () => {
  await connectDB();

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    console.log("=================================");
    console.log(`⚠ Admin already exists: ${ADMIN_EMAIL}`);
    console.log("=================================");
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "SuperAdmin",
    });

    console.log("=================================");
    console.log("✅ Admin seeded successfully");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("=================================");
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Failed to seed admin:", error.message);
  process.exit(1);
});
