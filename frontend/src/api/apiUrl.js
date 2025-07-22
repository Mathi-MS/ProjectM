export const apiUrls = {
  login: "auth/login",
  register: "auth/register",
  profile: "auth/profile",
  logout: "auth/logout",

  // User management endpoints
  users: "users",
  userById: (id) => `users/${id}`,
  createUser: "users",
  updateUser: (id) => `users/${id}`,
  deleteUser: (id) => `users/${id}`,
};
