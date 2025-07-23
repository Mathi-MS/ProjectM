// Test script to verify form persistence functionality
const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

// Test credentials (you should replace with actual test user credentials)
const testUser = {
  email: "test@example.com",
  password: "Test123456",
};

async function testFormPersistence() {
  try {
    console.log("🧪 Testing Form Persistence...\n");

    // Step 1: Login to get authentication token
    console.log("1. Logging in...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // Step 2: Create a new form
    console.log("2. Creating a new form...");
    const createFormResponse = await axios.post(
      `${BASE_URL}/forms/create`,
      { formName: "Test Form for Persistence" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const formId = createFormResponse.data.form.id;
    console.log(`✅ Form created with ID: ${formId}\n`);

    // Step 3: Get the form by ID (this simulates clicking form builder)
    console.log("3. Retrieving form by ID (simulating form builder load)...");
    const getFormResponse = await axios.get(`${BASE_URL}/forms/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📋 Form data structure:");
    console.log(JSON.stringify(getFormResponse.data, null, 2));
    console.log("");

    // Step 4: Update the form with some fields
    console.log("4. Updating form with fields...");
    const sampleFields = [
      {
        id: "field_1",
        type: "text",
        label: "Sample Text Field",
        name: "sample_text",
        required: true,
        gridSize: 6,
      },
      {
        id: "field_2",
        type: "email",
        label: "Email Field",
        name: "sample_email",
        required: false,
        gridSize: 6,
      },
    ];

    const updateFormResponse = await axios.put(
      `${BASE_URL}/forms/${formId}`,
      {
        formName: "Test Form for Persistence (Updated)",
        fields: sampleFields,
        metadata: {
          created: new Date().toISOString(),
          version: "1.0",
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("✅ Form updated with fields\n");

    // Step 5: Retrieve the form again to verify persistence
    console.log("5. Retrieving form again to verify persistence...");
    const verifyFormResponse = await axios.get(`${BASE_URL}/forms/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const persistedForm = verifyFormResponse.data;
    console.log("📋 Persisted form data:");
    console.log(`Form Name: ${persistedForm.formName}`);
    console.log(`Fields Count: ${persistedForm.fields.length}`);
    console.log(`Fields: ${JSON.stringify(persistedForm.fields, null, 2)}`);

    if (persistedForm.fields.length === 2) {
      console.log("\n✅ SUCCESS: Form persistence is working correctly!");
      console.log(
        "✅ The form builder should now load previously saved forms."
      );
    } else {
      console.log("\n❌ FAILURE: Form fields were not persisted correctly.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testFormPersistence();
