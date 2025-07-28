const axios = require("axios");

async function getUsers() {
  try {
    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        email: "admin@cableforms.com",
        password: "password",
      }
    );

    const token = loginResponse.data.token;

    const usersResponse = await axios.get("http://localhost:5001/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Available Users:");
    usersResponse.data.users.forEach((user) => {
      console.log(
        `- ID: ${user._id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}`
      );
    });

    return usersResponse.data.users[0]._id;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

getUsers();
