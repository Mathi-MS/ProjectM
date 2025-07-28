const mongoose = require("mongoose");
const Template = require("./models/Template");

async function checkIndexes() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("Connected to MongoDB");

    // Get collection directly
    const collection = mongoose.connection.db.collection("templates");

    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log("Indexes on templates collection:");
    indexes.forEach((index) => {
      console.log("Index:", JSON.stringify(index, null, 2));
    });

    // Check if there are any templates with publicId
    const templatesWithPublicId = await collection
      .find({ publicId: { $exists: true } })
      .toArray();
    console.log(
      "\nTemplates with publicId field:",
      templatesWithPublicId.length
    );

    // Check templates with null publicId
    const templatesWithNullPublicId = await collection
      .find({ publicId: null })
      .toArray();
    console.log(
      "Templates with null publicId:",
      templatesWithNullPublicId.length
    );

    // Check all templates
    const allTemplates = await collection.find({}).toArray();
    console.log("Total templates:", allTemplates.length);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkIndexes();
