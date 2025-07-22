const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/cable-forms";
    await mongoose.connect(mongoURI);
    console.log("🍃 Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findByEmail("admin@cableforms.com");
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@cableforms.com",
      password: "password", // This will be hashed by the pre-save hook
      role: "Admin",
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");

    // Create sample regular user
    const existingUser = await User.findByEmail("john@cableforms.com");
    if (!existingUser) {
      const sampleUser = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@cableforms.com",
        password: "password", // This will be hashed by the pre-save hook
        role: "User",
      });

      await sampleUser.save();
      console.log("✅ Sample user created successfully");
    } else {
      console.log("✅ Sample user already exists");
    }

    console.log("\n🎉 Database seeding completed!");
    console.log("👤 Admin: admin@cableforms.com (password: password)");
    console.log("👤 User: john@cableforms.com (password: password)");
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedUsers();
  await mongoose.connection.close();
  console.log("🔌 Database connection closed");
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedUsers };
