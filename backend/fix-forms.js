const mongoose = require("mongoose");
require("dotenv").config();

const fixForms = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/cable-forms";
    await mongoose.connect(mongoURI);

    console.log("🔧 Starting form repair process...");

    const Form = require("./models/Form");
    const User = require("./models/User");

    // Get first admin user to assign to orphaned forms
    const adminUser = await User.findOne({ role: "Admin" });
    if (!adminUser) {
      console.error(
        "❌ No admin user found. Please create an admin user first."
      );
      return;
    }

    console.log(
      `📋 Using admin user: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`
    );

    // Find forms without createdBy field
    const formsWithoutCreatedBy = await Form.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined },
      ],
    });

    console.log(
      `🔍 Found ${formsWithoutCreatedBy.length} forms without createdBy field`
    );

    if (formsWithoutCreatedBy.length === 0) {
      console.log("✅ All forms already have createdBy field!");
      await mongoose.connection.close();
      return;
    }

    // Update forms to have the admin user as creator
    for (const form of formsWithoutCreatedBy) {
      console.log(`🔧 Fixing form: "${form.formName}" (ID: ${form._id})`);

      form.createdBy = adminUser._id;
      await form.save();

      console.log(`✅ Fixed form: "${form.formName}"`);
    }

    console.log(`🎉 Successfully fixed ${formsWithoutCreatedBy.length} forms!`);

    // Verify the fix
    const remainingBrokenForms = await Form.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined },
      ],
    });

    if (remainingBrokenForms.length === 0) {
      console.log("✅ Verification passed: All forms now have createdBy field");
    } else {
      console.log(`❌ ${remainingBrokenForms.length} forms still need fixing`);
    }

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error fixing forms:", error);
    process.exit(1);
  }
};

fixForms();
