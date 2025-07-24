const axios = require("axios");

async function testConnection() {
  const ports = [5000, 5001];

  for (const port of ports) {
    try {
      console.log(`Testing connection to port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/health`);
      console.log(`✅ Port ${port} is working!`);
      console.log(`Response:`, response.data);
      return port;
    } catch (error) {
      console.log(`❌ Port ${port} failed:`, error.message);
    }
  }

  console.log("❌ No working port found");
  return null;
}

testConnection();
