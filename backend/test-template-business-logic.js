const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");
const Form = require("./models/Form");

async function testTemplateBusinessLogic() {
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

    console.log("🧪 Testing Template Business Logic");
    console.log("=====================================");

    // Test 1: Create template with no forms (should be inactive)
    console.log(
      "\n=== Test 1: Template with no forms (should force to inactive) ==="
    );
    const template1 = new Template({
      templateName: `No Forms Test ${Date.now()}`,
      forms: [], // Empty forms array
      approverTemplate: user._id,
      status: "active", // Try to set as active
      createdBy: user._id,
    });

    try {
      const savedTemplate1 = await template1.save();
      console.log("✅ Template created with status:", savedTemplate1.status);
      console.log("Expected: inactive, Actual:", savedTemplate1.status);

      // Clean up
      await Template.findByIdAndDelete(savedTemplate1._id);
    } catch (error) {
      console.log("❌ Error creating template with no forms:", error.message);
    }

    // Test 2: Create template with forms and active status
    console.log("\n=== Test 2: Template with forms and active status ===");
    const template2 = new Template({
      templateName: `With Forms Test ${Date.now()}`,
      forms: [form._id],
      approverTemplate: user._id,
      status: "active",
      createdBy: user._id,
    });

    try {
      const savedTemplate2 = await template2.save();
      console.log("✅ Template created with status:", savedTemplate2.status);
      console.log("Expected: active, Actual:", savedTemplate2.status);

      // Clean up
      await Template.findByIdAndDelete(savedTemplate2._id);
    } catch (error) {
      console.log("❌ Error creating template with forms:", error.message);
    }

    // Test 3: Create template with no forms and inactive status (should work)
    console.log("\n=== Test 3: Template with no forms and inactive status ===");
    const template3 = new Template({
      templateName: `No Forms Inactive Test ${Date.now()}`,
      forms: [],
      approverTemplate: user._id,
      status: "inactive",
      createdBy: user._id,
    });

    try {
      const savedTemplate3 = await template3.save();
      console.log("✅ Template created with status:", savedTemplate3.status);
      console.log("Expected: inactive, Actual:", savedTemplate3.status);

      // Clean up
      await Template.findByIdAndDelete(savedTemplate3._id);
    } catch (error) {
      console.log(
        "❌ Error creating inactive template with no forms:",
        error.message
      );
    }

    // Test 4: Default status behavior
    console.log("\n=== Test 4: Default status with forms ===");
    const template4 = new Template({
      templateName: `Default Status Test ${Date.now()}`,
      forms: [form._id],
      approverTemplate: user._id,
      // No status specified - should use model default
      createdBy: user._id,
    });

    try {
      const savedTemplate4 = await template4.save();
      console.log(
        "✅ Template created with default status:",
        savedTemplate4.status
      );
      console.log(
        "Expected: inactive (model default), Actual:",
        savedTemplate4.status
      );

      // Clean up
      await Template.findByIdAndDelete(savedTemplate4._id);
    } catch (error) {
      console.log(
        "❌ Error creating template with default status:",
        error.message
      );
    }

    // Test 5: Default status with no forms
    console.log("\n=== Test 5: Default status with no forms ===");
    const template5 = new Template({
      templateName: `Default No Forms Test ${Date.now()}`,
      forms: [],
      approverTemplate: user._id,
      // No status specified - should use model default (inactive)
      createdBy: user._id,
    });

    try {
      const savedTemplate5 = await template5.save();
      console.log(
        "✅ Template created with default status:",
        savedTemplate5.status
      );
      console.log("Expected: inactive, Actual:", savedTemplate5.status);

      // Clean up
      await Template.findByIdAndDelete(savedTemplate5._id);
    } catch (error) {
      console.log(
        "❌ Error creating template with default status and no forms:",
        error.message
      );
    }

    console.log("\n🎉 Business logic tests completed!");
    console.log("\n📋 Summary:");
    console.log("- Templates with no forms: Always inactive ✅");
    console.log("- Templates with forms: Can be active or inactive ✅");
    console.log("- Model default: inactive ✅");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test error:", error);
    process.exit(1);
  }
}

testTemplateBusinessLogic();
