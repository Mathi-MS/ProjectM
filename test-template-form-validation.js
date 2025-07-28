const mongoose = require("./backend/node_modules/mongoose");
const Template = require("./backend/models/Template");
const Form = require("./backend/models/Form");
const User = require("./backend/models/User");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/FormBuilderDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testTemplateFormValidation() {
  try {
    console.log("🚀 Starting Template-Form Validation Tests...\n");

    // Clean up any existing test data
    await Template.deleteMany({ templateName: /^Test Template/ });
    await Form.deleteMany({ formName: /^Test Form/ });
    await User.deleteMany({ firstName: /^Test User/ });

    // Test 0: Create a test user for approver
    console.log("📝 Test 0: Creating test user for approver...");

    const testUser = new User({
      firstName: "Test User",
      lastName: "Approver",
      email: "test.approver@test.com",
      password: "testpassword123",
      role: "Admin",
    });
    await testUser.save();
    console.log(`✅ Created test user: ${testUser._id}\n`);

    // Test 1: Create forms with different statuses
    console.log("📝 Test 1: Creating forms with different statuses...");

    const activeForm = new Form({
      formName: "Test Form Active",
      status: "active",
      fields: [{ id: "field1", type: "text", label: "Test Field" }],
    });
    await activeForm.save();
    console.log(`✅ Created active form: ${activeForm._id}`);

    const inactiveForm = new Form({
      formName: "Test Form Inactive",
      status: "inactive",
      fields: [{ id: "field2", type: "text", label: "Test Field 2" }],
    });
    await inactiveForm.save();
    console.log(`✅ Created inactive form: ${inactiveForm._id}\n`);

    // Test 2: Create template with only active forms
    console.log("📝 Test 2: Creating template with only active forms...");

    const templateWithActiveForms = new Template({
      templateName: "Test Template With Active Forms",
      forms: [activeForm._id],
      approverTemplate: testUser._id, // Real approver ID
      status: "active",
    });

    try {
      await templateWithActiveForms.save();
      console.log(
        `✅ Template with active forms created successfully: ${templateWithActiveForms._id}`
      );
    } catch (error) {
      console.log(
        `❌ Failed to create template with active forms: ${error.message}`
      );
    }

    // Test 3: Try to create template with only inactive forms
    console.log(
      "\n📝 Test 3: Trying to create template with only inactive forms..."
    );

    const templateWithInactiveForms = new Template({
      templateName: "Test Template With Inactive Forms",
      forms: [inactiveForm._id],
      approverTemplate: testUser._id, // Real approver ID
      status: "active",
    });

    try {
      await templateWithInactiveForms.save();
      console.log(
        `❌ Template with inactive forms should not have been created: ${templateWithInactiveForms._id}`
      );
    } catch (error) {
      console.log(
        `✅ Correctly prevented creation of template with inactive forms: ${error.message}`
      );
    }

    // Test 4: Create template with mixed forms (should allow inactive status)
    console.log(
      "\n📝 Test 4: Creating template with mixed forms (inactive status)..."
    );

    const templateWithMixedForms = new Template({
      templateName: "Test Template With Mixed Forms",
      forms: [activeForm._id, inactiveForm._id],
      approverTemplate: testUser._id, // Real approver ID
      status: "inactive", // Should be allowed
    });

    try {
      await templateWithMixedForms.save();
      console.log(
        `✅ Template with mixed forms (inactive) created successfully: ${templateWithMixedForms._id}`
      );
    } catch (error) {
      console.log(
        `❌ Failed to create template with mixed forms: ${error.message}`
      );
    }

    // Test 5: Try to activate template with mixed forms
    console.log("\n📝 Test 5: Trying to activate template with mixed forms...");

    try {
      await templateWithMixedForms.activate();
      console.log(
        `✅ Template activated successfully (has at least one active form)`
      );
    } catch (error) {
      console.log(`❌ Failed to activate template: ${error.message}`);
    }

    // Test 6: Deactivate the active form and check template status
    console.log(
      "\n📝 Test 6: Deactivating the active form to test automatic template deactivation..."
    );

    console.log(
      `Template status before form deactivation: ${templateWithMixedForms.status}`
    );

    activeForm.status = "inactive";
    await activeForm.save();

    // Reload template to check if it was automatically deactivated
    const reloadedTemplate = await Template.findById(
      templateWithMixedForms._id
    );
    console.log(
      `Template status after form deactivation: ${reloadedTemplate.status}`
    );

    if (reloadedTemplate.status === "inactive") {
      console.log(
        `✅ Template was automatically deactivated when last active form became inactive`
      );
    } else {
      console.log(`❌ Template should have been automatically deactivated`);
    }

    // Test 7: Test validation method directly
    console.log("\n📝 Test 7: Testing validation method directly...");

    const validation = await templateWithMixedForms.canBeActivated();
    console.log(`Validation result: ${JSON.stringify(validation, null, 2)}`);

    // Test 8: Test stats method
    console.log("\n📝 Test 8: Testing stats method...");

    const stats = await templateWithMixedForms.getStats();
    console.log(`Stats result: ${JSON.stringify(stats, null, 2)}`);

    console.log("\n🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up test data
    console.log("\n🧹 Cleaning up test data...");
    await Template.deleteMany({ templateName: /^Test Template/ });
    await Form.deleteMany({ formName: /^Test Form/ });
    await User.deleteMany({ firstName: /^Test User/ });
    console.log("✅ Cleanup completed");

    mongoose.disconnect();
  }
}

// Run the tests
testTemplateFormValidation();
