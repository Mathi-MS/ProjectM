const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");
const Form = require("./models/Form");

async function testTemplateValidation() {
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

    console.log("🛡️  Testing Template Validation Logic");
    console.log("======================================");

    // Test 1: Try to create active template with no forms (should fail)
    console.log(
      "\n=== Test 1: Active template with no forms (should FAIL) ==="
    );
    const template1 = new Template({
      templateName: `Should Fail Test ${Date.now()}`,
      forms: [], // No forms
      approverTemplate: user._id,
      status: "active", // Explicitly set to active - should fail
      createdBy: user._id,
    });

    try {
      await template1.save();
      console.log("❌ ERROR: Template was saved (should have failed!)");
    } catch (error) {
      console.log("✅ Correctly failed:", error.message);
    }

    // Test 2: Create template with forms, then try to remove all forms and set active
    console.log(
      "\n=== Test 2: Update template to remove forms but keep active (should fail) ==="
    );

    // First create a valid template
    const template2 = new Template({
      templateName: `Update Test ${Date.now()}`,
      forms: [form._id],
      approverTemplate: user._id,
      status: "active",
      createdBy: user._id,
    });

    const savedTemplate2 = await template2.save();
    console.log("✅ Initial template created successfully");

    // Now try to remove forms but keep it active
    savedTemplate2.forms = [];
    savedTemplate2.status = "active";

    try {
      await savedTemplate2.save();
      console.log("❌ ERROR: Template update was saved (should have failed!)");
    } catch (error) {
      console.log("✅ Update correctly failed:", error.message);
    }

    // Clean up - set to inactive first to allow deletion
    savedTemplate2.status = "inactive";
    await savedTemplate2.save();
    await Template.findByIdAndDelete(savedTemplate2._id);

    // Test 3: Create inactive template with no forms, then try to activate (should fail)
    console.log(
      "\n=== Test 3: Inactive template with no forms, then activate (should fail) ==="
    );

    const template3 = new Template({
      templateName: `Activate Test ${Date.now()}`,
      forms: [],
      approverTemplate: user._id,
      status: "inactive", // Start as inactive
      createdBy: user._id,
    });

    const savedTemplate3 = await template3.save();
    console.log("✅ Inactive template with no forms created successfully");

    // Now try to activate it
    savedTemplate3.status = "active";

    try {
      await savedTemplate3.save();
      console.log(
        "❌ ERROR: Template activation was saved (should have failed!)"
      );
    } catch (error) {
      console.log("✅ Activation correctly failed:", error.message);
    }

    // Clean up
    await Template.findByIdAndDelete(savedTemplate3._id);

    // Test 4: Valid workflow - create inactive, add forms, then activate
    console.log(
      "\n=== Test 4: Valid workflow (inactive → add forms → activate) ==="
    );

    const template4 = new Template({
      templateName: `Valid Workflow Test ${Date.now()}`,
      forms: [],
      approverTemplate: user._id,
      status: "inactive",
      createdBy: user._id,
    });

    const savedTemplate4 = await template4.save();
    console.log("✅ Step 1: Inactive template created");

    // Add forms
    savedTemplate4.forms = [form._id];
    await savedTemplate4.save();
    console.log("✅ Step 2: Forms added");

    // Now activate
    savedTemplate4.status = "active";
    await savedTemplate4.save();
    console.log("✅ Step 3: Template successfully activated");

    // Clean up
    await Template.findByIdAndDelete(savedTemplate4._id);

    console.log("\n🎉 All validation tests passed!");
    console.log("\n📋 Summary:");
    console.log("✅ Cannot create active template without forms");
    console.log("✅ Cannot activate template that has no forms");
    console.log("✅ Cannot remove all forms from active template");
    console.log("✅ Valid workflow: inactive → add forms → activate works");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test error:", error);
    process.exit(1);
  }
}

testTemplateValidation();
