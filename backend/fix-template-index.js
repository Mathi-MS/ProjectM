const mongoose = require("mongoose");

async function fixTemplateIndex() {
  try {
    await mongoose.connect("mongodb://localhost:27017/cable-forms");
    console.log("Connected to MongoDB");

    // Get collection directly
    const collection = mongoose.connection.db.collection("templates");

    // List current indexes
    const indexes = await collection.listIndexes().toArray();
    console.log("Current indexes:");
    indexes.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the problematic publicId index
    try {
      await collection.dropIndex("publicId_1");
      console.log("Successfully dropped publicId_1 index");
    } catch (error) {
      if (error.code === 27) {
        console.log("Index publicId_1 does not exist (already dropped)");
      } else {
        throw error;
      }
    }

    // List indexes after dropping
    const indexesAfter = await collection.listIndexes().toArray();
    console.log("\nIndexes after cleanup:");
    indexesAfter.forEach((index) => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log("\nTemplate index fix completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixTemplateIndex();
