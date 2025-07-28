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

    console.log("Found user:", user.email);

    // Get a form for testing
    const form = await Form.findOne({ status: "active" });
    if (!form) {
      console.log("No active form found");
      return;
    }

    console.log("Found form:", form.formName);

    // Test template creation with the problematic name
    const templateName = "Test Template 123";
    console.log("Testing template creation with name:", templateName);

    // Escape special regex characters in template name (same as backend)
    const escapedTemplateName = templateName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    console.log("Escaped template name:", escapedTemplateName);

    const existingTemplate = await Template.findOne({
      templateName: { $regex: new RegExp(`^${escapedTemplateName}$`, "i") },
      isActive: true,
    });

    console.log("Existing template found:", existingTemplate);

    if (!existingTemplate) {
      console.log("No existing template found - creation should succeed");

      // Create a test template
      const newTemplate = new Template({
        templateName: templateName,
        forms: [form._id],
        approverTemplate: user._id,
        status: "active",
        createdBy: user._id,
        isActive: true,
      });

      const savedTemplate = await newTemplate.save();
      console.log("Template created successfully:", savedTemplate.templateName);

      // Clean up - delete the test template
      await Template.findByIdAndDelete(savedTemplate._id);
      console.log("Test template cleaned up");
    } else {
      console.log("Template already exists - creation should fail");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testTemplateCreation();
