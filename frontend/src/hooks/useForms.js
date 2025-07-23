import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../Interceptors/Interceptor";

// Get all forms
export const useForms = (options = {}) => {
  return useQuery({
    queryKey: ["forms", options],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (options.page) params.append("page", options.page);
      if (options.limit) params.append("limit", options.limit);
      if (options.search) params.append("search", options.search);
      if (options.sortBy) params.append("sortBy", options.sortBy);
      if (options.sortOrder) params.append("sortOrder", options.sortOrder);

      const response = await api.get(`/forms?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get form by ID
export const useForm = (id) => {
  return useQuery({
    queryKey: ["form", id],
    queryFn: async () => {
      const response = await api.get(`/forms/${id}`);
      console.log("useForm API response:", response.data);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Create new form (just name)
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("/forms/create", formData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch forms list
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success(data.message || "Form created successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create form";
      toast.error(errorMessage);
      throw error;
    },
  });
};

// Update form (full form with fields)
export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await api.put(`/forms/${id}`, formData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch forms list
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      // Invalidate and refetch specific form
      queryClient.invalidateQueries({ queryKey: ["form", variables.id] });
      toast.success(data.message || "Form updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update form";
      toast.error(errorMessage);
      throw error;
    },
  });
};

// Update form name
export const useUpdateFormName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formName }) => {
      const response = await api.put(`/forms/${id}/name`, { formName });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch forms list
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      // Invalidate and refetch specific form
      queryClient.invalidateQueries({ queryKey: ["form", variables.id] });
      toast.success(data.message || "Form name updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update form name";
      toast.error(errorMessage);
      throw error;
    },
  });
};

// Update form status
export const useUpdateFormStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.put(`/forms/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch forms list
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      // Invalidate and refetch specific form
      queryClient.invalidateQueries({ queryKey: ["form", variables.id] });
      toast.success(data.message || "Form status updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update form status";
      toast.error(errorMessage);
      throw error;
    },
  });
};

// Delete form
export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/forms/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch forms list
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success(data.message || "Form deleted successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete form";
      toast.error(errorMessage);
      throw error;
    },
  });
};
