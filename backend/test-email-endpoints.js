const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

// Test credentials - you'll need to replace these with actual values
const TEST_EMAIL = "gopal@example.com"; // Replace with actual email
const AUTH_TOKEN = "your-jwt-token-here"; // Replace with actual JWT token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function testEmailEndpoints() {
  console.log("🧪 Testing Email-based User Endpoints\n");

  try {
    // Test 1: Get user by email
    console.log("1️⃣ Testing GET /api/users/email/:email");
    try {
      const response = await api.get(`/users/email/${TEST_EMAIL}`);
      console.log("✅ Success:", response.data);
      console.log("User found:", response.data.user);
    } catch (error) {
      console.log("❌ Error:", error.response?.data || error.message);
    }
    console.log("");

    // Test 2: Update user by email
    console.log("2️⃣ Testing PUT /api/users/email/:email");
    try {
      const updateData = {
        firstName: "Updated Gopal",
        isActive: true,
      };
      const response = await api.put(`/users/email/${TEST_EMAIL}`, updateData);
      console.log("✅ Success:", response.data);
    } catch (error) {
      console.log("❌ Error:", error.response?.data || error.message);
    }
    console.log("");

    // Test 3: Delete user by email (commented out for safety)
    console.log(
      "3️⃣ Testing DELETE /api/users/email/:email (commented out for safety)"
    );
    console.log("⚠️  Skipped - uncomment to test deletion");
    /*
    try {
      const response = await api.delete(`/users/email/${TEST_EMAIL}`);
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    */
  } catch (error) {
    console.error("🚨 Test setup error:", error.message);
  }
}

// Instructions for usage
console.log(`
📋 INSTRUCTIONS:
1. Make sure the backend server is running on port 5001
2. Replace TEST_EMAIL with an actual user email from your database
3. Replace AUTH_TOKEN with a valid JWT token (login first)
4. Run: node test-email-endpoints.js

🔧 To get a JWT token:
1. Use POST /api/auth/login with valid credentials
2. Copy the token from the response
3. Paste it in the AUTH_TOKEN variable above

📧 New endpoints available:
- GET /api/users/email/:email - Get user by email
- PUT /api/users/email/:email - Update user by email  
- DELETE /api/users/email/:email - Delete user by email

💡 These endpoints solve the "Invalid user ID format" error by using email instead of ObjectId
`);

// Run the tests
testEmailEndpoints();
