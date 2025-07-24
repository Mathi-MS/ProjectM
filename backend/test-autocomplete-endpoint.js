const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

// You'll need to replace this with a valid JWT token
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2EyMWRhZWMyNjViMWNlMmFkNjUwMCIsImVtYWlsIjoiYWRtaW5AY2FibGVmb3Jtcy5jb20iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NTMzNDAyOTcsImV4cCI6MTc1MzQyNjY5N30.Qh_8lsAT9NocpOnNSe-PSh02mdQPwJA7ECQIdb9amYI";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function testAutocompleteEndpoint() {
  console.log("🧪 Testing Autocomplete Endpoint\n");

  try {
    // Test 1: Autocomplete without search parameter
    console.log("1️⃣ Testing GET /api/users/autocomplete (no search)");
    try {
      const response = await api.get("/users/autocomplete");
      console.log("✅ Success:", response.data);
      console.log(`Found ${response.data.users.length} users`);
    } catch (error) {
      console.log("❌ Error:", error.response?.data || error.message);
    }
    console.log("");

    // Test 2: Autocomplete with search parameter
    console.log("2️⃣ Testing GET /api/users/autocomplete?search=admin");
    try {
      const response = await api.get("/users/autocomplete?search=admin");
      console.log("✅ Success:", response.data);
      console.log(`Found ${response.data.users.length} users matching "admin"`);
    } catch (error) {
      console.log("❌ Error:", error.response?.data || error.message);
    }
  } catch (error) {
    console.error("🚨 Test setup error:", error.message);
  }
}

// Instructions for usage
console.log(`
📋 INSTRUCTIONS:
1. Make sure the backend server is running on port 5001
2. Replace AUTH_TOKEN with a valid JWT token (login first)
3. Run: node test-autocomplete-endpoint.js

🔧 To get a JWT token:
1. Use POST /api/auth/login with valid credentials
2. Copy the token from the response
3. Paste it in the AUTH_TOKEN variable above

🎯 This test checks if the autocomplete endpoint works correctly
   after fixing the route ordering issue.
`);

// Run the test
testAutocompleteEndpoint();
