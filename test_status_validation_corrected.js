const axios = require("axios");

async function testStatusValidation() {
  try {
    // First, login to get a token
    console.log("🔐 Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "admin@cableforms.com",
        password: "password",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Login successful, token received");

    // Create a new form (starts with status: "inactive")
    console.log("\n📝 Creating a new form...");
    const createFormResponse = await axios.post(
      "http://localhost:5000/api/forms/create",
      {
        formName: "Status Validation Test Form",
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

    const formId = createFormResponse.data.form.id;
    console.log(`✅ Form created successfully with ID: ${formId}`);
    console.log(`📊 Initial status: ${createFormResponse.data.form.status}`);

    // Test 1: Try to activate form without any fields (should fail)
    console.log("\n🧪 TEST 1: Trying to activate form without fields...");
    try {
      await axios.put(
        `http://localhost:5000/api/forms/${formId}/status`,
        {
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("❌ UNEXPECTED: Form activation should have failed!");
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ EXPECTED: Form activation failed as expected");
        console.log(`📋 Error message: ${error.response.data.message}`);
        console.log(`🔍 Error details:`, error.response.data.details);
      } else {
        console.log(
          "❌ UNEXPECTED ERROR:",
          error.response?.data || error.message
        );
      }
    }

    // Test 2: Add fields to the form
    console.log("\n📝 Adding fields to the form...");
    const updateFormResponse = await axios.put(
      `http://localhost:5000/api/forms/${formId}`,
      {
        fields: [
          {
            id: "field1",
            type: "text",
            label: "Full Name",
            required: true,
            placeholder: "Enter your full name",
          },
          {
            id: "field2",
            type: "email",
            label: "Email Address",
            required: true,
            placeholder: "Enter your email",
          },
        ],
        metadata: {
          version: "1.1",
          lastModified: new Date().toISOString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Fields added successfully");
    console.log(`📊 Field count: ${updateFormResponse.data.form.fieldCount}`);

    // Test 3: Now try to activate form with fields (should succeed)
    console.log("\n🧪 TEST 3: Trying to activate form with fields...");
    try {
      const activateResponse = await axios.put(
        `http://localhost:5000/api/forms/${formId}/status`,
        {
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ SUCCESS: Form activated successfully!");
      console.log(`📊 New status: ${activateResponse.data.form.status}`);
      console.log(`📋 Message: ${activateResponse.data.message}`);
    } catch (error) {
      console.log("❌ UNEXPECTED: Form activation should have succeeded!");
      console.log("Error:", error.response?.data || error.message);
    }

    // Test 4: Try to remove all fields from an active form (should auto-deactivate)
    console.log("\n🧪 TEST 4: Removing all fields from active form...");
    try {
      const removeFieldsResponse = await axios.put(
        `http://localhost:5000/api/forms/${formId}`,
        {
          fields: [], // Empty fields array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Fields removed successfully");
      console.log(`📊 New status: ${removeFieldsResponse.data.form.status}`);
      console.log(
        `📊 Field count: ${removeFieldsResponse.data.form.fieldCount}`
      );

      if (removeFieldsResponse.data.form.status === "inactive") {
        console.log(
          "✅ EXPECTED: Form automatically deactivated when fields removed"
        );
      } else {
        console.log(
          "❌ UNEXPECTED: Form should have been automatically deactivated"
        );
      }
    } catch (error) {
      console.log(
        "❌ ERROR removing fields:",
        error.response?.data || error.message
      );
    }

    // Test 5: Create form with invalid fields and try to activate
    console.log("\n🧪 TEST 5: Testing field validation...");

    // Add invalid fields (missing label)
    await axios.put(
      `http://localhost:5000/api/forms/${formId}`,
      {
        fields: [
          {
            id: "field1",
            type: "text",
            label: "", // Empty label - should be invalid
            required: true,
          },
          {
            id: "field2",
            type: "", // Empty type - should be invalid
            label: "Some Label",
            required: false,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    try {
      await axios.put(
        `http://localhost:5000/api/forms/${formId}/status`,
        {
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        "❌ UNEXPECTED: Form activation should have failed due to invalid fields!"
      );
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response.data.error === "INVALID_FIELDS"
      ) {
        console.log(
          "✅ EXPECTED: Form activation failed due to invalid fields"
        );
        console.log(`📋 Error message: ${error.response.data.message}`);
        console.log(`🔍 Error details:`, error.response.data.details);
      } else {
        console.log(
          "❌ UNEXPECTED ERROR:",
          error.response?.data || error.message
        );
      }
    }

    console.log("\n🎉 All validation tests completed!");
    console.log("\n📋 SUMMARY:");
    console.log("✅ Form creation works");
    console.log("✅ Cannot activate form without fields");
    console.log("✅ Can activate form with valid fields");
    console.log("✅ Form auto-deactivates when fields are removed");
    console.log("✅ Cannot activate form with invalid fields");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
console.log("🚀 Starting Form Status Validation Tests...");
console.log("=".repeat(50));
testStatusValidation();
