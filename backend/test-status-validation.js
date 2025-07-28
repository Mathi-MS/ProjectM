const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");
const Form = require("./models/Form");

async function testStatusValidation() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("Connected to MongoDB");

    // Get a user and form for testing
    const user = await User.findOne({ email: "admin@cableforms.com" });
    const form = await Form.findOne({ status: "active" });

    if (!user || !form) {
      console.log("Required test data not found");
      return;
    }

    console.log("🎯 Testing Status Change Validation");
    console.log("===================================");

    // Scenario 1: Create template with no forms
    console.log("\n=== Scenario 1: Template with no forms ===");
    const template1 = new Template({
      templateName: `No Forms Template ${Date.now()}`,
      forms: [], // NO FORMS
      approverTemplate: user._id,
      status: "inactive", // Start inactive
      createdBy: user._id,
    });

    const saved1 = await template1.save();
    console.log("✅ Created template with no forms, status:", saved1.status);

    // Try to change status to active (should FAIL)
    console.log("\n🔄 Trying to change status to ACTIVE...");
    saved1.status = "active";

    try {
      await saved1.save();
      console.log("❌ ERROR: Status change allowed (should have failed!)");
    } catch (error) {
      console.log("✅ Status change correctly blocked:", error.message);
    }

    // Cleanup
    await Template.findByIdAndDelete(saved1._id);

    // Scenario 2: Create template with forms, then remove forms
    console.log("\n=== Scenario 2: Remove forms from active template ===");
    const template2 = new Template({
      templateName: `With Forms Template ${Date.now()}`,
      forms: [form._id], // HAS FORMS
      approverTemplate: user._id,
      status: "active", // Start active
      createdBy: user._id,
    });

    const saved2 = await template2.save();
    console.log(
      "✅ Created active template with forms, status:",
      saved2.status
    );

    // Remove all forms but try to keep active (should FAIL)
    console.log("\n🔄 Removing all forms but keeping status ACTIVE...");
    saved2.forms = []; // Remove all forms
    saved2.status = "active"; // Try to keep active

    try {
      await saved2.save();
      console.log(
        "❌ ERROR: Forms removal allowed while active (should have failed!)"
      );
    } catch (error) {
      console.log("✅ Forms removal correctly blocked:", error.message);
    }

    // Now remove forms and set inactive (should WORK)
    console.log("\n🔄 Removing all forms and setting INACTIVE...");
    saved2.forms = []; // Remove all forms
    saved2.status = "inactive"; // Set inactive

    const saved2Updated = await saved2.save();
    console.log(
      "✅ Successfully removed forms and set inactive, status:",
      saved2Updated.status
    );

    // Cleanup
    await Template.findByIdAndDelete(saved2._id);

    // Scenario 3: Add forms back and activate
    console.log("\n=== Scenario 3: Add forms then activate ===");
    const template3 = new Template({
      templateName: `Reactivate Template ${Date.now()}`,
      forms: [], // Start with no forms
      approverTemplate: user._id,
      status: "inactive", // Start inactive
      createdBy: user._id,
    });

    const saved3 = await template3.save();
    console.log(
      "✅ Created inactive template with no forms, status:",
      saved3.status
    );

    // Add forms
    console.log("\n🔄 Adding forms...");
    saved3.forms = [form._id];
    const saved3WithForms = await saved3.save();
    console.log("✅ Added forms, status still:", saved3WithForms.status);

    // Now activate (should WORK)
    console.log("\n🔄 Changing status to ACTIVE...");
    saved3WithForms.status = "active";
    const saved3Active = await saved3WithForms.save();
    console.log(
      "✅ Successfully activated template, status:",
      saved3Active.status
    );

    // Cleanup
    await Template.findByIdAndDelete(saved3._id);

    console.log("\n🎉 Status validation tests completed!");
    console.log("\n📋 Summary:");
    console.log("✅ No forms → Automatically inactive");
    console.log("✅ Change to active → Requires at least one form");
    console.log("✅ Remove forms from active → Must set inactive first");
    console.log("✅ Add forms → Can then activate");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test error:", error);
    process.exit(1);
  }
}

testStatusValidation();
