const mongoose = require("mongoose");

async function addTemplateNameIndex() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("Connected to MongoDB");

    // Get collection directly
    const collection = mongoose.connection.db.collection("templates");

    // Create a compound unique index for templateName and isActive
    // This ensures that only one active template with the same name can exist
    try {
      await collection.createIndex(
        { templateName: 1, isActive: 1 },
        {
          unique: true,
          name: "templateName_isActive_unique",
          partialFilterExpression: { isActive: true },
          collation: { locale: "en", strength: 2 }, // Case-insensitive
        }
      );
      console.log(
        "Successfully created unique index for templateName + isActive"
      );
    } catch (error) {
      if (error.code === 85) {
        console.log("Index already exists");
      } else {
        throw error;
      }
    }

    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log("\nCurrent indexes:");
    indexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.unique) console.log("  (unique)");
      if (index.partialFilterExpression)
        console.log(
          `  (partial: ${JSON.stringify(index.partialFilterExpression)})`
        );
    });

    console.log("\nTemplate name index creation completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addTemplateNameIndex();
