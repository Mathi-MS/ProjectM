const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");
const Form = require("./models/Form");

async function testTemplateStatus() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("Connected to MongoDB");

    // Get a user for testing
    const user = await User.findOne({ email: "admin@cableforms.com" });
    if (!user) {
      console.log("Admin user not found");
      return;
    }

    // Get a form for testing
    const form = await Form.findOne({ status: "active" });
    if (!form) {
      console.log("No active form found");
      return;
    }

    // Test 1: Create template without specifying status (should default to "active")
    console.log("\n=== Test 1: Default status (should be 'active') ===");
    const template1 = new Template({
      templateName: `Default Status Test ${Date.now()}`,
      forms: [form._id],
      approverTemplate: user._id,
      createdBy: user._id,
    });

    const savedTemplate1 = await template1.save();
    console.log(
      "✅ Template created with default status:",
      savedTemplate1.status
    );

    // Test 2: Create template with explicit "inactive" status
    console.log("\n=== Test 2: Explicit 'inactive' status ===");
    const template2 = new Template({
      templateName: `Inactive Status Test ${Date.now()}`,
      forms: [form._id],
      approverTemplate: user._id,
      status: "inactive",
      createdBy: user._id,
    });

    const savedTemplate2 = await template2.save();
    console.log(
      "✅ Template created with inactive status:",
      savedTemplate2.status
    );

    // Test 3: Create template with explicit "active" status
    console.log("\n=== Test 3: Explicit 'active' status ===");
    const template3 = new Template({
      templateName: `Active Status Test ${Date.now()}`,
      forms: [form._id],
      approverTemplate: user._id,
      status: "active",
      createdBy: user._id,
    });

    const savedTemplate3 = await template3.save();
    console.log(
      "✅ Template created with active status:",
      savedTemplate3.status
    );

    // Clean up test templates
    await Template.findByIdAndDelete(savedTemplate1._id);
    await Template.findByIdAndDelete(savedTemplate2._id);
    await Template.findByIdAndDelete(savedTemplate3._id);
    console.log("\n✅ Test templates cleaned up");

    console.log("\n🎉 Template status tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test error:", error);
    process.exit(1);
  }
}

testTemplateStatus();
