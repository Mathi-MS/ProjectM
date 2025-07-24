const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

async function getJWTToken() {
  console.log("🔐 Getting JWT Token\n");

  try {
    // Login with sample admin credentials
    const loginData = {
      email: "admin@cableforms.com",
      password: "password",
    };

    console.log("Attempting login with:", loginData.email);

    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);

    console.log("✅ Login successful!");
    console.log("🎫 JWT Token:", response.data.token);
    console.log("\n📋 Copy this token and use it in your test files:");
    console.log(`AUTH_TOKEN = "${response.data.token}"`);

    return response.data.token;
  } catch (error) {
    console.log("❌ Login failed:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log("\n💡 Try running: npm run seed");
      console.log("   This will create the sample users if they don't exist.");
    }
  }
}

// Run the function
getJWTToken();
