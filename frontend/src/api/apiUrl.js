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
  usersAutocomplete: "users/autocomplete",

  // Form management endpoints
  forms: "forms",
  saveForm: "forms/save",
  formById: (id) => `forms/${id}`,
  updateForm: (id) => `forms/${id}`,
  deleteForm: (id) => `forms/${id}`,
};
