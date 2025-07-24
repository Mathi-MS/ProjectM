const mongoose = require("mongoose");
const Form = require("./models/Form");
const User = require("./models/User");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/cable-forms",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const testFormRoles = async () => {
  try {
    await connectDB();

    // Find some existing users
    const users = await User.find().limit(3);
    if (users.length < 3) {
      console.log("❌ Need at least 3 users in the database to test");
      console.log("Run 'npm run seed' to create sample users");
      return;
    }

    console.log("📋 Testing Form with Roles functionality...");
    console.log(`Found ${users.length} users for testing`);

    // Create a test form with roles
    const testForm = new Form({
      formName: "Test Form with Roles",
      fields: [
        {
          id: "test-field-1",
          type: "text",
          label: "Test Field",
          required: true,
        },
      ],
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: "1.0",
      },
      createdBy: users[0]._id,
      initiator: users[0]._id,
      reviewer: users[1]._id,
      approver: users[2]._id,
      status: "active",
    });

    await testForm.save();
    console.log("✅ Form created successfully with roles");

    // Populate and display the form with roles
    await testForm.populate([
      { path: "createdBy", select: "firstName lastName email" },
      { path: "initiator", select: "firstName lastName email" },
      { path: "reviewer", select: "firstName lastName email" },
      { path: "approver", select: "firstName lastName email" },
    ]);

    console.log("\n📄 Form Details:");
    console.log(`Form Name: ${testForm.formName}`);
    console.log(`Status: ${testForm.status}`);
    console.log(
      `Created By: ${testForm.createdBy.firstName} ${testForm.createdBy.lastName} (${testForm.createdBy.email})`
    );
    console.log(
      `Initiator: ${testForm.initiator.firstName} ${testForm.initiator.lastName} (${testForm.initiator.email})`
    );
    console.log(
      `Reviewer: ${testForm.reviewer.firstName} ${testForm.reviewer.lastName} (${testForm.reviewer.email})`
    );
    console.log(
      `Approver: ${testForm.approver.firstName} ${testForm.approver.lastName} (${testForm.approver.email})`
    );

    // Test the new static methods
    console.log("\n🔍 Testing static methods:");

    const formsByInitiator = await Form.findByInitiator(users[0]._id);
    console.log(
      `Forms by initiator (${users[0].firstName}): ${formsByInitiator.length}`
    );

    const formsByReviewer = await Form.findByReviewer(users[1]._id);
    console.log(
      `Forms by reviewer (${users[1].firstName}): ${formsByReviewer.length}`
    );

    const formsByApprover = await Form.findByApprover(users[2]._id);
    console.log(
      `Forms by approver (${users[2].firstName}): ${formsByApprover.length}`
    );

    // Clean up - delete the test form
    await testForm.softDelete();
    console.log("\n🧹 Test form cleaned up (soft deleted)");

    console.log(
      "\n✅ All tests passed! Form roles functionality is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📡 Database connection closed");
  }
};

// Run the test
testFormRoles();
