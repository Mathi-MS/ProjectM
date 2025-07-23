const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/cable-forms";

    console.log("Attempting to connect to:", mongoURI);

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connected successfully to "cable-forms" database');

    // Test the connection by listing collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📋 Available collections:",
      collections.map((c) => c.name)
    );

    // Test User model
    const User = require("./models/User");
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);

    // Test Form model
    const Form = require("./models/Form");
    const formCount = await Form.countDocuments();
    console.log(`📝 Total forms in database: ${formCount}`);

    // List some forms
    const forms = await Form.find({})
      .limit(3)
      .select("formName createdBy status isActive");
    console.log("📄 Sample forms:", forms);

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

connectDB();
