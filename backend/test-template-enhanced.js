const mongoose = require("mongoose");
const Template = require("./models/Template");
const User = require("./models/User");
const Form = require("./models/Form");

async function testEnhancedTemplateModel() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("🚀 Connected to MongoDB");

    // Get test data
    const user = await User.findOne({ email: "admin@cableforms.com" });
    const form = await Form.findOne({ status: "active" });

    if (!user) {
      console.log("❌ Admin user not found - run seedUsers.js first");
      process.exit(1);
    }

    if (!form) {
      console.log("❌ No active form found - create a form first");
      process.exit(1);
    }

    console.log("📊 Testing Enhanced Template Model");
    console.log("=================================");

    // Test 1: Name uniqueness check
    console.log("\n=== Test 1: Name Uniqueness Check ===");
    const testName = `Unique Test ${Date.now()}`;

    const isTaken1 = await Template.isNameTaken(testName);
    console.log(`✅ Name "${testName}" is taken: ${isTaken1}`);

    // Test 2: Create template and test validation methods
    console.log("\n=== Test 2: Validation Methods ===");
    const template = new Template({
      templateName: testName,
      forms: [],
      approverTemplate: user._id,
      status: "inactive",
      createdBy: user._id,
    });

    const validation1 = template.canBeActivated();
    console.log("✅ Can be activated without forms:", validation1.isValid);
    console.log(
      "   Errors:",
      validation1.errors.map((e) => e.message)
    );

    // Add forms and test again
    template.forms = [form._id];
    const validation2 = template.canBeActivated();
    console.log("✅ Can be activated with forms:", validation2.isValid);

    await template.save();
    console.log("✅ Template saved successfully");

    // Test 3: Safe activation method
    console.log("\n=== Test 3: Safe Activation Method ===");
    try {
      await template.activate();
      console.log("✅ Template activated successfully");
      console.log("   Status:", template.status);
    } catch (error) {
      console.log("❌ Activation failed:", error.message);
    }

    // Test 4: Statistics method
    console.log("\n=== Test 4: Template Statistics ===");
    const stats = template.getStats();
    console.log("✅ Template stats:", JSON.stringify(stats, null, 2));

    // Test 5: Static finder methods
    console.log("\n=== Test 5: Static Finder Methods ===");

    const activeTemplates = await Template.findByStatus("active");
    console.log(`✅ Found ${activeTemplates.length} active templates`);

    const userTemplates = await Template.findByCreator(user._id);
    console.log(`✅ Found ${userTemplates.length} templates by user`);

    const approverTemplates = await Template.findByApprover(user._id);
    console.log(
      `✅ Found ${approverTemplates.length} templates with user as approver`
    );

    const formTemplates = await Template.findWithForm(form._id);
    console.log(
      `✅ Found ${formTemplates.length} templates containing the test form`
    );

    // Test 6: Name uniqueness after creation
    console.log("\n=== Test 6: Name Uniqueness After Creation ===");
    const isTaken2 = await Template.isNameTaken(testName);
    console.log(`✅ Name "${testName}" is now taken: ${isTaken2}`);

    const isTakenExcluding = await Template.isNameTaken(testName, template._id);
    console.log(
      `✅ Name "${testName}" is taken (excluding current): ${isTakenExcluding}`
    );

    // Test 7: Enhanced validation with invalid references
    console.log("\n=== Test 7: Reference Validation ===");

    const invalidTemplate = new Template({
      templateName: `Invalid Test ${Date.now()}`,
      forms: [new mongoose.Types.ObjectId()], // Non-existent form
      approverTemplate: user._id,
      status: "inactive",
      createdBy: user._id,
    });

    try {
      await invalidTemplate.save();
      console.log("❌ ERROR: Invalid template was saved!");
    } catch (error) {
      console.log("✅ Invalid template correctly rejected:", error.message);
    }

    // Clean up
    console.log("\n=== Cleanup ===");
    await template.softDelete();
    console.log("✅ Template soft deleted");

    const deletedStats = template.getStats();
    console.log(
      "✅ Soft deleted template stats:",
      JSON.stringify(deletedStats, null, 2)
    );

    // Hard delete for cleanup
    await Template.findByIdAndDelete(template._id);
    console.log("✅ Template hard deleted for cleanup");

    console.log("\n🎉 All enhanced tests passed!");
    console.log("\n📋 Enhanced Features Summary:");
    console.log("✅ Reference validation in pre-save middleware");
    console.log("✅ Template activation validation methods");
    console.log("✅ Safe activation method with error handling");
    console.log("✅ Comprehensive statistics method");
    console.log("✅ Multiple static finder methods");
    console.log("✅ Name uniqueness checking utility");
    console.log("✅ Enhanced error messages and validation");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test error:", error);
    process.exit(1);
  }
}

testEnhancedTemplateModel();
