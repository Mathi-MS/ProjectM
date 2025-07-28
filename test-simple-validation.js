const mongoose = require("./backend/node_modules/mongoose");
const Template = require("./backend/models/Template");
const Form = require("./backend/models/Form");
const User = require("./backend/models/User");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/FormBuilderDB");

async function testSimpleValidation() {
  try {
    console.log("🧪 Testing Template-Form Validation...\n");

    // Clean up
    await Template.deleteMany({ templateName: /^Simple Test/ });
    await Form.deleteMany({ formName: /^Simple Test/ });
    await User.deleteMany({ firstName: /^Simple Test/ });

    // 1. Create a test user
    const testUser = new User({
      firstName: "Simple Test",
      lastName: "User",
      email: "simple@test.com",
      password: "password123",
      role: "Admin",
    });
    await testUser.save();
    console.log("✅ Created test user");

    // 2. Create an active form
    const activeForm = new Form({
      formName: "Simple Test Active Form",
      status: "active",
      fields: [{ id: "field1", type: "text", label: "Test Field" }],
    });
    await activeForm.save();
    console.log("✅ Created active form");

    // 3. Create template with active form - should work
    console.log("\n📝 Test 1: Creating template with active form...");
    const template = new Template({
      templateName: "Simple Test Template",
      forms: [activeForm._id],
      approverTemplate: testUser._id,
      status: "active",
    });

    try {
      await template.save();
      console.log(
        "✅ Template created successfully with status:",
        template.status
      );
    } catch (error) {
      console.log("❌ Failed to create template:", error.message);
      return;
    }

    // 4. Deactivate the form - template should become inactive
    console.log("\n📝 Test 2: Deactivating the form...");
    console.log("Template status before:", template.status);

    activeForm.status = "inactive";
    await activeForm.save();

    // Check template status after by reloading from database
    const reloadedTemplate = await Template.findById(template._id);
    console.log("Template status after:", reloadedTemplate.status);

    if (reloadedTemplate.status === "inactive") {
      console.log("✅ SUCCESS: Template automatically became inactive");
    } else {
      console.log(
        "❌ FAILED: Template should be inactive but is:",
        reloadedTemplate.status
      );
    }

    // 5. Try to activate template with no active forms - should fail
    console.log(
      "\n📝 Test 3: Trying to activate template with no active forms..."
    );
    try {
      template.status = "active";
      await template.save();
      console.log("❌ FAILED: Template should not be allowed to activate");
    } catch (error) {
      console.log("✅ SUCCESS: Template activation prevented:", error.message);
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    // Cleanup
    await Template.deleteMany({ templateName: /^Simple Test/ });
    await Form.deleteMany({ formName: /^Simple Test/ });
    await User.deleteMany({ firstName: /^Simple Test/ });
    mongoose.disconnect();
  }
}

testSimpleValidation();
