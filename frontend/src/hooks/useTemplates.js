import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../Interceptors/Interceptor";

// Get all templates
export const useTemplates = (options = {}) => {
  return useQuery({
    queryKey: ["templates", options],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (options.page) params.append("page", options.page);
      if (options.limit) params.append("limit", options.limit);
      if (options.search) params.append("search", options.search);
      if (options.sortBy) params.append("sortBy", options.sortBy);
      if (options.sortOrder) params.append("sortOrder", options.sortOrder);

      const response = await api.get(`/templates?${params.toString()}`);
      console.log("useTemplates API URL:", `/templates?${params.toString()}`);
      console.log("useTemplates API response:", response.data);
      console.log(
        "Templates returned from API:",
        response.data?.templates?.length || 0
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get template by ID
export const useTemplate = (id) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const response = await api.get(`/templates/${id}`);
      console.log("useTemplate API response:", response.data);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create new template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData) => {
      console.log("Creating template with data:", templateData);
      const response = await api.post("/templates", templateData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created successfully!");
      console.log("Template created:", data);
    },
    onError: (error) => {
      console.error("Template creation error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create template";
      toast.error(message);
    },
  });
};

// Update template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, templateData }) => {
      console.log("Updating template:", id, "with data:", templateData);
      const response = await api.put(`/templates/${id}`, templateData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", variables.id] });
      toast.success("Template updated successfully!");
      console.log("Template updated:", data);
    },
    onError: (error) => {
      console.error("Template update error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update template";
      toast.error(message);
    },
  });
};

// Update template status
export const useUpdateTemplateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      console.log("Updating template status:", id, "to:", status);
      const response = await api.patch(`/templates/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", variables.id] });
      const statusText = variables.status === "active" ? "activated" : "deactivated";
      toast.success(`Template ${statusText} successfully!`);
      console.log("Template status updated:", data);
    },
    onError: (error) => {
      console.error("Template status update error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update template status";
      toast.error(message);
    },
  });
};

// Delete template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("Deleting template:", id);
      const response = await api.delete(`/templates/${id}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.removeQueries({ queryKey: ["template", variables] });
      toast.success("Template deleted successfully!");
      console.log("Template deleted:", data);
    },
    onError: (error) => {
      console.error("Template deletion error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete template";
      toast.error(message);
    },
  });
};