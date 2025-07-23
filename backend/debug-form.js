const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/cable-forms";
    await mongoose.connect(mongoURI);

    const Form = require("./models/Form");

    // Find forms without createdBy field
    const formsWithoutCreatedBy = await Form.find({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: undefined },
      ],
    }).select("formName createdBy status isActive");

    console.log("Forms without createdBy field:", formsWithoutCreatedBy);

    // Find all forms and show their createdBy field
    const allForms = await Form.find({}).select(
      "formName createdBy status isActive"
    );
    console.log("\nAll forms with createdBy status:");
    allForms.forEach((form) => {
      console.log(
        `- ${form.formName}: createdBy = ${
          form.createdBy
        } (type: ${typeof form.createdBy})`
      );
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
};

connectDB();
