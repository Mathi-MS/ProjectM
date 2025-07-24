const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const testAutocomplete = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/cable-forms"
    );
    console.log("✅ Connected to MongoDB");

    // Test the autocomplete query
    const users = await User.find({ isActive: true })
      .select("_id firstName lastName email")
      .limit(20)
      .sort({ firstName: 1, lastName: 1 });

    console.log("📋 Autocomplete Users:");
    const autocompleteData = users.map((user) => ({
      id: user._id,
      value: user._id,
      label: `${user.firstName} ${user.lastName}`,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    }));

    console.log(JSON.stringify(autocompleteData, null, 2));
    console.log(`\n✅ Found ${autocompleteData.length} users for autocomplete`);
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📡 Database connection closed");
  }
};

testAutocomplete();
