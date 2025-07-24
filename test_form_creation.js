const axios = require("axios");

async function testFormCreation() {
  try {
    // First, login to get a token
    console.log("Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        email: "admin@cableforms.com",
        password: "password",
      }
    );

    const token = loginResponse.data.token;
    console.log("Login successful, token received");

    // Create first form
    console.log("\n=== Creating first form ===");
    const firstForm = await axios.post(
      "http://localhost:5001/api/forms/create",
      {
        formName: "Test Form 1",
        initiator: null,
        reviewer: null,
        approver: null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "First form created successfully:",
      firstForm.data.form.formName
    );

    // Create second form
    console.log("\n=== Creating second form ===");
    const secondForm = await axios.post(
      "http://localhost:5001/api/forms/create",
      {
        formName: "Test Form 2",
        initiator: null,
        reviewer: null,
        approver: null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "Second form created successfully:",
      secondForm.data.form.formName
    );
    console.log("\n✅ Both forms created successfully! The issue is fixed.");
  } catch (error) {
    console.error("❌ Error occurred:", error.response?.data || error.message);
  }
}

testFormCreation();
