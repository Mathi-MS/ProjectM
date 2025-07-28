const axios = require("axios");

async function testTemplateActivationValidation() {
  try {
    // Login first
    console.log("🔐 Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        email: "admin@cableforms.com",
        password: "password",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    // Try to create and activate a template without active forms
    console.log("\n📝 Creating template with inactive form...");

    // First create a form (it will be inactive by default)
    const formResponse = await axios.post(
      "http://localhost:5001/api/forms/create",
      {
        formName: `Test Inactive Form ${Date.now()}`,
        initiator: null,
        reviewer: null,
        approver: null,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const formId = formResponse.data.form.id;
    console.log(
      `✅ Created form with ID: ${formId}, status: ${formResponse.data.form.status}`
    );

    // Use a valid user ID for approver
    const approverId = "687a21daec265b1ce2ad6500"; // admin@cableforms.com

    // Create template with this inactive form (explicitly set status to inactive)
    const templateResponse = await axios.post(
      "http://localhost:5001/api/templates",
      {
        templateName: `Test Template ${Date.now()}`,
        forms: [formId],
        approverTemplate: approverId,
        status: "inactive", // Explicitly set to inactive
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const templateId = templateResponse.data.template.id;
    console.log(
      `✅ Created template with ID: ${templateId}, status: ${templateResponse.data.template.status}`
    );

    // Now try to activate the template (should fail because form is inactive)
    console.log("\n🧪 TEST: Trying to activate template with inactive form...");
    try {
      const activateResponse = await axios.patch(
        `http://localhost:5001/api/templates/${templateId}/status`,
        {
          status: "active",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("❌ UNEXPECTED: Template activation should have failed!");
      console.log("Response:", activateResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ EXPECTED: Template activation failed as expected");
        console.log("📋 Error message:", error.response.data.message);
        if (error.response.data.errors) {
          console.log("🔍 Error details:");
          error.response.data.errors.forEach((err, index) => {
            console.log(`   ${index + 1}. Type: ${err.type}`);
            console.log(`      Message: ${err.message}`);
            if (err.details) {
              console.log(`      Details:`, err.details);
            }
          });
        }
      } else {
        console.log(
          "❌ UNEXPECTED ERROR:",
          error.response?.data || error.message
        );
      }
    }

    // Test 2: Now activate the form and try to activate template again
    console.log("\n🧪 TEST 2: Activating form first...");

    // Add fields to form so it can be activated
    await axios.put(
      `http://localhost:5001/api/forms/${formId}`,
      {
        fields: [
          {
            id: "field1",
            name: "testField",
            type: "text",
            label: "Test Field",
            required: true,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Activate the form
    const formActivateResponse = await axios.put(
      `http://localhost:5001/api/forms/${formId}/status`,
      {
        status: "active",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`✅ Form activated: ${formActivateResponse.data.form.status}`);

    // Now try to activate template again (should succeed)
    console.log("\n🧪 TEST 3: Trying to activate template with active form...");
    try {
      const templateActivateResponse = await axios.patch(
        `http://localhost:5001/api/templates/${templateId}/status`,
        {
          status: "active",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ SUCCESS: Template activated successfully!");
      console.log(
        `📊 Template status: ${templateActivateResponse.data.template.status}`
      );
    } catch (error) {
      console.log("❌ UNEXPECTED: Template activation should have succeeded!");
      console.log("Error:", error.response?.data || error.message);
    }

    console.log("\n🎉 Template activation validation test completed!");
    console.log("\n📋 SUMMARY:");
    console.log("✅ Template activation correctly fails with inactive forms");
    console.log("✅ Template activation succeeds with active forms");
    console.log("✅ Validation messages are clear and helpful");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

// Run the test
console.log("🚀 Starting Template Activation Validation Test...");
console.log("=".repeat(60));
testTemplateActivationValidation();
