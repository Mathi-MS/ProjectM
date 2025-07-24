const axios = require("axios");

// Test the comprehensive field validation system
async function testValidation() {
  const baseURL = "http://localhost:5001/api";

  console.log("🧪 Testing Comprehensive Field Validation System\n");

  // First, let's get a token by logging in
  try {
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: "admin@cableforms.com",
      password: "password",
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log("✅ Successfully logged in\n");

    // Test 1: Valid fields
    console.log("📋 Test 1: Valid Fields");
    const validFields = [
      {
        id: "field_1",
        name: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "Enter your first name",
        required: true,
        gridSize: 6,
        validations: {
          minLength: 2,
          maxLength: 50,
        },
      },
      {
        id: "field_2",
        name: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
        gridSize: 6,
        validations: {
          email: true,
        },
      },
      {
        id: "field_3",
        name: "age",
        type: "number",
        label: "Age",
        placeholder: "Enter your age",
        required: false,
        gridSize: 3,
        validations: {
          min: 18,
          max: 100,
        },
      },
    ];

    try {
      const validationResponse = await axios.post(
        `${baseURL}/forms/validate-fields`,
        {
          fields: validFields,
        },
        { headers }
      );

      console.log("✅ Valid fields test passed");
      console.log(
        `   - Total fields: ${validationResponse.data.summary.totalFields}`
      );
      console.log(
        `   - Valid fields: ${validationResponse.data.summary.validFields}`
      );
      console.log(`   - Errors: ${validationResponse.data.summary.errorCount}`);
      console.log(
        `   - Warnings: ${validationResponse.data.summary.warningCount}\n`
      );
    } catch (error) {
      console.log(
        "❌ Valid fields test failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test 2: Invalid fields
    console.log("📋 Test 2: Invalid Fields");
    const invalidFields = [
      {
        id: "field_1",
        name: "", // Missing name
        type: "text",
        label: "", // Missing label
        placeholder: "",
        required: true,
        gridSize: 6,
      },
      {
        id: "field_2",
        name: "invalid-name", // Invalid name format
        type: "select",
        label: "Select Option",
        placeholder: "Choose option",
        required: true,
        gridSize: 6,
        options: [], // Missing options
      },
      {
        id: "field_3",
        name: "testField",
        type: "number",
        label: "Test Number",
        placeholder: "Enter number",
        required: false,
        gridSize: 15, // Invalid grid size
        validations: {
          min: 100,
          max: 50, // Invalid: min > max
        },
      },
    ];

    try {
      const invalidResponse = await axios.post(
        `${baseURL}/forms/validate-fields`,
        {
          fields: invalidFields,
        },
        { headers }
      );

      console.log("⚠️  Invalid fields test completed");
      console.log(
        `   - Total fields: ${invalidResponse.data.summary.totalFields}`
      );
      console.log(
        `   - Valid fields: ${invalidResponse.data.summary.validFields}`
      );
      console.log(`   - Errors: ${invalidResponse.data.summary.errorCount}`);
      console.log(
        `   - Warnings: ${invalidResponse.data.summary.warningCount}`
      );
      console.log("   - Error details:");
      invalidResponse.data.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
      console.log("");
    } catch (error) {
      console.log(
        "❌ Invalid fields test failed:",
        error.response?.data?.message || error.message
      );
      if (error.response?.data?.errors) {
        console.log("   - Validation errors:");
        error.response.data.errors.forEach((err, index) => {
          // Handle both string errors and express-validator error objects
          const errorMessage =
            typeof err === "string"
              ? err
              : err.msg || err.message || JSON.stringify(err);
          console.log(`     ${index + 1}. ${errorMessage}`);
        });
      }
      console.log("");
    }

    // Test 3: Create form with validation
    console.log("📋 Test 3: Create Form with Field Validation");
    const formData = {
      formName: "Test Validation Form",
      fields: validFields,
    };

    try {
      const createResponse = await axios.post(
        `${baseURL}/forms/save`,
        formData,
        { headers }
      );
      console.log("✅ Form creation with valid fields passed");
      console.log(`   - Form ID: ${createResponse.data.form.id}`);
      console.log(`   - Fields count: ${createResponse.data.form.fieldsCount}`);
      if (
        createResponse.data.warnings &&
        createResponse.data.warnings.length > 0
      ) {
        console.log("   - Warnings:");
        createResponse.data.warnings.forEach((warning, index) => {
          console.log(`     ${index + 1}. ${warning}`);
        });
      }
      console.log("");
    } catch (error) {
      console.log(
        "❌ Form creation test failed:",
        error.response?.data?.message || error.message
      );
      if (error.response?.data?.errors) {
        console.log("   - Validation errors:");
        error.response.data.errors.forEach((err, index) => {
          // Handle both string errors and express-validator error objects
          const errorMessage =
            typeof err === "string"
              ? err
              : err.msg || err.message || JSON.stringify(err);
          console.log(`     ${index + 1}. ${errorMessage}`);
        });
      }
      console.log("");
    }

    // Test 4: Create form with invalid fields
    console.log("📋 Test 4: Create Form with Invalid Fields");
    const invalidFormData = {
      formName: "Invalid Form",
      fields: invalidFields,
    };

    try {
      const invalidCreateResponse = await axios.post(
        `${baseURL}/forms/save`,
        invalidFormData,
        { headers }
      );
      console.log(
        "⚠️  This should not succeed - form created despite invalid fields"
      );
    } catch (error) {
      console.log("✅ Form creation with invalid fields correctly rejected");
      console.log(
        `   - Error: ${error.response?.data?.message || error.message}`
      );
      if (error.response?.data?.errors) {
        console.log("   - Validation errors:");
        error.response.data.errors.forEach((err, index) => {
          // Handle both string errors and express-validator error objects
          const errorMessage =
            typeof err === "string"
              ? err
              : err.msg || err.message || JSON.stringify(err);
          console.log(`     ${index + 1}. ${errorMessage}`);
        });
      }
      console.log("");
    }

    // Test 5: Test specific field types
    console.log("📋 Test 5: Specific Field Type Validations");

    // Test select field with options
    const selectField = {
      id: "field_select",
      name: "country",
      type: "select",
      label: "Country",
      placeholder: "Select country",
      required: true,
      gridSize: 6,
      options: [
        { label: "United States", value: "us" },
        { label: "Canada", value: "ca" },
        { label: "United Kingdom", value: "uk" },
      ],
    };

    // Test header field
    const headerField = {
      id: "field_header",
      name: "section_header",
      type: "header",
      text: "Personal Information",
      variant: "h3",
      align: "left",
      gridSize: 12,
    };

    // Test file field
    const fileField = {
      id: "field_file",
      name: "resume",
      type: "file",
      label: "Resume",
      required: false,
      gridSize: 6,
      multiple: false,
      validations: {
        fileType: ["application/pdf", "application/msword"],
        fileSize: 5,
      },
    };

    const specificFields = [selectField, headerField, fileField];

    try {
      const specificResponse = await axios.post(
        `${baseURL}/forms/validate-fields`,
        {
          fields: specificFields,
        },
        { headers }
      );

      console.log("✅ Specific field types validation passed");
      console.log(
        `   - Total fields: ${specificResponse.data.summary.totalFields}`
      );
      console.log(
        `   - Valid fields: ${specificResponse.data.summary.validFields}`
      );
      console.log(`   - Errors: ${specificResponse.data.summary.errorCount}`);
      console.log(
        `   - Warnings: ${specificResponse.data.summary.warningCount}\n`
      );
    } catch (error) {
      console.log(
        "❌ Specific field types test failed:",
        error.response?.data?.message || error.message
      );
    }

    console.log("🎉 All validation tests completed!\n");
  } catch (error) {
    console.log(
      "❌ Login failed:",
      error.response?.data?.message || error.message
    );
    console.log("Make sure the backend is running and sample users exist.");
    console.log(
      "Run: npm run seed in the backend directory to create sample users."
    );
  }
}

// Run the tests
testValidation().catch(console.error);
