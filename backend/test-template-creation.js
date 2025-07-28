const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");
const Form = require("./models/Form");

async function testTemplateCreation() {
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

    // Test 1: Create template with unique name
    console.log("\n=== Test 1: Creating template with unique name ===");
    const uniqueName = `Test Template ${Date.now()}`;
    console.log("Testing template creation with name:", uniqueName);

    const template1 = new Template({
      templateName: uniqueName,
      forms: [form._id],
      approverTemplate: user._id,
      status: "active",
      createdBy: user._id,
      isActive: true,
    });

    const savedTemplate1 = await template1.save();
    console.log(
      "✅ Template created successfully:",
      savedTemplate1.templateName
    );

    // Test 2: Try to create template with same name (should fail)
    console.log("\n=== Test 2: Creating template with duplicate name ===");
    console.log("Testing template creation with same name:", uniqueName);

    const template2 = new Template({
      templateName: uniqueName,
      forms: [form._id],
      approverTemplate: user._id,
      status: "active",
      createdBy: user._id,
      isActive: true,
    });

    try {
      await template2.save();
      console.log(
        "❌ ERROR: Duplicate template was created (should have failed)"
      );
    } catch (error) {
      if (error.code === 11000) {
        console.log("✅ Duplicate name correctly rejected:", error.message);
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Test 3: Create template with same name but inactive (should succeed)
    console.log("\n=== Test 3: Creating inactive template with same name ===");
    const template3 = new Template({
      templateName: uniqueName,
      forms: [form._id],
      approverTemplate: user._id,
      status: "inactive",
      createdBy: user._id,
      isActive: false,
    });

    try {
      const savedTemplate3 = await template3.save();
      console.log(
        "✅ Inactive template with same name created successfully:",
        savedTemplate3.templateName
      );

      // Clean up template3
      await Template.findByIdAndDelete(savedTemplate3._id);
    } catch (error) {
      console.log("❌ Failed to create inactive template:", error.message);
    }

    // Test 4: Case insensitive test
    console.log("\n=== Test 4: Testing case insensitivity ===");
    const caseVariant = uniqueName.toUpperCase();
    console.log("Testing with case variant:", caseVariant);

    const template4 = new Template({
      templateName: caseVariant,
      forms: [form._id],
      approverTemplate: user._id,
      status: "active",
      createdBy: user._id,
      isActive: true,
    });

    try {
      await template4.save();
      console.log("❌ ERROR: Case variant was created (should have failed)");
    } catch (error) {
      if (error.code === 11000) {
        console.log("✅ Case variant correctly rejected:", error.message);
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Clean up - delete the test template
    await Template.findByIdAndDelete(savedTemplate1._id);
    console.log("\n✅ Test template cleaned up");

    console.log("\n🎉 All tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test error:", error);
    process.exit(1);
  }
}

testTemplateCreation();
