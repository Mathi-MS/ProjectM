import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../api/apiService";
import { apiUrls } from "../api/apiUrl";

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await callApi(`${apiUrls.login}`, "POST", data);
      return response;
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await callApi(`${apiUrls.register}`, "POST", data);
      return response;
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

// User Management Hooks
export const useUsers = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "firstName",
    sortOrder = "asc",
  } = params;

  return useQuery({
    queryKey: ["users", { page, limit, search, sortBy, sortOrder }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
      });

      const response = await callApi(`${apiUrls.users}?${queryParams}`, "GET");
      return response;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await callApi(apiUrls.userById(id), "GET");
      return response;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const response = await callApi(apiUrls.createUser, "POST", userData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Create user error:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userData }) => {
      const response = await callApi(apiUrls.updateUser(id), "PUT", userData);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
    onError: (error) => {
      console.error("Update user error:", error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await callApi(apiUrls.deleteUser(id), "DELETE");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Delete user error:", error);
    },
  });
};
