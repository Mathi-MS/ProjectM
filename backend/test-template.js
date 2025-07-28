const mongoose = require("mongoose");
const Template = require("./models/Template");

async function testTemplateQuery() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("Connected to MongoDB");

    const testName = "Test Template 123";
    console.log("Testing template name:", testName);

    const existingTemplate = await Template.findOne({
      templateName: { $regex: new RegExp(`^${testName}$`, "i") },
      isActive: true,
    });

    console.log("Existing template found:", existingTemplate);

    // Also test without case insensitive
    const existingTemplateExact = await Template.findOne({
      templateName: testName,
      isActive: true,
    });

    console.log("Existing template found (exact):", existingTemplateExact);

    // Test with the existing template name
    const existingQwd = await Template.findOne({
      templateName: { $regex: new RegExp(`^qwd$`, "i") },
      isActive: true,
    });

    console.log("Existing qwd template found:", existingQwd ? "YES" : "NO");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testTemplateQuery();
