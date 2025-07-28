import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
  Chip,
  Tooltip,
  Alert,
  TablePagination,
  TableSortLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Autocomplete,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useUpdateTemplateStatus,
  useDeleteTemplate,
} from "../hooks/useTemplates";
import { useForms } from "../hooks/useForms";
import { useUsers } from "../hooks/useAuth";

// Validation schema for template creation and editing
const templateSchema = z.object({
  templateName: z
    .string()
    .min(3, "Template name must be at least 3 characters"),
  forms: z.array(z.string()).min(1, "At least one form must be selected"),
  approverTemplate: z.string().min(1, "Approver template is required"),
});

const Templates = () => {
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', or 'view'

  // Sorting and pagination states
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form setup - unified for both add and edit
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateName: "",
      forms: [],
      approverTemplate: "",
    },
  });

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set form values when editing
  useEffect(() => {
    if (modalMode === "edit" && selectedTemplate && openModal) {
      const templateData = {
        templateName: selectedTemplate.templateName || "",
        forms: selectedTemplate.forms?.map((form) => form.id || form._id) || [],
        approverTemplate:
          selectedTemplate.approverTemplate?.id ||
          selectedTemplate.approverTemplate?._id ||
          selectedTemplate.approverTemplate ||
          "",
      };

      console.log("useEffect - Setting template values:", templateData);
      console.log("Selected template data:", selectedTemplate);

      // Use setTimeout to ensure the modal is fully rendered before setting values
      setTimeout(() => {
        reset(templateData);
      }, 100);
    }
  }, [modalMode, selectedTemplate, openModal, reset]);

  // Additional effect to handle form reset when modal closes
  useEffect(() => {
    if (!openModal) {
      // Clear selected template and reset form
      setSelectedTemplate(null);
      setModalMode("add");
      reset({
        templateName: "",
        forms: [],
        approverTemplate: "",
      });
    }
  }, [openModal, reset]);

  // API hooks
  const apiParams = {
    page: page + 1, // API uses 1-based pagination
    limit: rowsPerPage,
    search: debouncedSearchTerm,
    sortBy,
    sortOrder: sortDirection,
  };

  console.log("API Parameters:", apiParams);

  const {
    data: templatesData,
    isLoading,
    error,
    refetch,
  } = useTemplates(apiParams);

  // Get active forms for dropdown
  const {
    data: formsData,
    isLoading: formsLoading,
    error: formsError,
  } = useForms({
    page: 1,
    limit: 100, // Get more forms for dropdown
    search: "",
    sortBy: "formName",
    sortOrder: "asc",
  });

  // Users data for select dropdowns
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers({
    page: 1,
    limit: 100, // Get more users for dropdown
    search: "",
    sortBy: "firstName",
    sortOrder: "asc",
  });

  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const updateTemplateStatusMutation = useUpdateTemplateStatus();
  const deleteTemplateMutation = useDeleteTemplate();

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Watch form values for debugging
  const watchedValues = watch();
  console.log("Current form values:", watchedValues);

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
    setPage(0); // Reset to first page when sorting
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  // Modal handlers
  const handleAddTemplate = () => {
    console.log("Opening add template modal");
    setSelectedTemplate(null);
    setModalMode("add");
    // Reset form to ensure clean state
    reset({
      templateName: "",
      forms: [],
      approverTemplate: "",
    });
    setOpenModal(true);
  };

  const handleEditTemplate = (template) => {
    console.log("Edit template data:", template);
    setSelectedTemplate(template);
    setModalMode("edit");
    // Don't reset here - let the useEffect handle it
    setOpenModal(true);
  };

  const handleDeleteTemplate = (template) => {
    setSelectedTemplate(template);
    setOpenDeleteModal(true);
  };

  const handleViewTemplate = (template) => {
    console.log("View template:", template);
    setSelectedTemplate(template);
    setOpenViewModal(true);
  };

  const handleStatusToggle = async (template) => {
    try {
      const newStatus = template.status === "active" ? "inactive" : "active";
      await updateTemplateStatusMutation.mutateAsync({
        id: template.id,
        status: newStatus,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Form submission handler - unified for both add and edit
  const onSubmit = async (data) => {
    console.log("Form submission:", { modalMode, data, selectedTemplate });

    try {
      if (modalMode === "add") {
        console.log("Creating new template with data:", data);
        await createTemplateMutation.mutateAsync(data);
      } else if (modalMode === "edit" && selectedTemplate) {
        console.log(
          "Updating template:",
          selectedTemplate.id,
          "with data:",
          data
        );
        await updateTemplateMutation.mutateAsync({
          id: selectedTemplate.id,
          templateData: {
            templateName: data.templateName,
            forms: data.forms,
            approverTemplate: data.approverTemplate,
          },
        });
      } else {
        console.error("Invalid modal mode or missing selected template");
        toast.error("Invalid operation mode");
        return;
      }
      setOpenModal(false);
    } catch (error) {
      console.error("Form submission error:", error);
      // Error is handled by the mutation hooks
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTemplateMutation.mutateAsync(selectedTemplate.id);
      setOpenDeleteModal(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const closeModal = () => {
    console.log("Closing modal");
    setOpenModal(false);
    // Reset will be handled by useEffect
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedTemplate(null);
  };

  const closeViewModal = () => {
    setOpenViewModal(false);
    setSelectedTemplate(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 1, sm: 2 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || "Failed to load templates"}
        </Alert>
        <Button onClick={() => refetch()} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  const templates = templatesData?.templates || [];
  const pagination = templatesData?.pagination || {};
  const forms =
    formsData?.forms?.filter((form) => form.status === "active") || [];
  const users = usersData?.users || [];

  // Debug logs
  console.log("Templates data:", templatesData);
  console.log("Pagination data:", pagination);
  console.log("Active forms:", forms);
  console.log("Users:", users);

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        p: { xs: 1, sm: 2 },
        width: "100%",
      }}
    >
      <Card elevation={3}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: "1.65rem", sm: "1.5rem" },
            }}
          >
            Templates Management
          </Typography>

          {/* Header with Search and Add Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              mb: 3,
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            <TextField
              size="small"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: { xs: 250, sm: 300 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTemplate}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                backgroundColor: "#457860",
                "&:hover": {
                  backgroundColor: "#2d5a3d",
                },
              }}
            >
              Add Template
            </Button>
          </Box>

          {/* Templates Table */}
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "templateName"}
                      direction={
                        sortBy === "templateName" ? sortDirection : "asc"
                      }
                      onClick={() => handleSort("templateName")}
                      sx={{ fontWeight: 600 }}
                    >
                      Template Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Form Names</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "status"}
                      direction={sortBy === "status" ? sortDirection : "asc"}
                      onClick={() => handleSort("status")}
                      sx={{ fontWeight: 600 }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortDirection : "asc"}
                      onClick={() => handleSort("createdAt")}
                      sx={{ fontWeight: 600 }}
                    >
                      Created Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {debouncedSearchTerm
                          ? "No templates found matching your search."
                          : "No templates available. Create your first template!"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow
                      key={template.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(69, 120, 96, 0.04)",
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AssignmentIcon
                            sx={{ color: "#457860", fontSize: "1.2rem" }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {template.templateName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {template.formNames || "No forms"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={template.status === "active"}
                              onChange={() => handleStatusToggle(template)}
                              size="small"
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#457860",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor: "#457860",
                                  },
                              }}
                            />
                          }
                          label={
                            <Chip
                              label={template.status}
                              size="small"
                              color={
                                template.status === "active"
                                  ? "success"
                                  : "default"
                              }
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 500,
                                minWidth: 70,
                              }}
                            />
                          }
                          sx={{ ml: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(template.createdDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View Template">
                            <IconButton
                              size="small"
                              onClick={() => handleViewTemplate(template)}
                              sx={{
                                color: "#457860",
                                "&:hover": {
                                  backgroundColor: "rgba(69, 120, 96, 0.1)",
                                },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Template">
                            <IconButton
                              size="small"
                              onClick={() => handleEditTemplate(template)}
                              sx={{
                                color: "#1976d2",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Template">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTemplate(template)}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": {
                                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {templates.length > 0 && (
            <TablePagination
              component="div"
              count={pagination.totalItems || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: "1px solid #e0e0e0",
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: 2,
                  paddingRight: 2,
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Template Modal */}
      <Dialog
        open={openModal}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {modalMode === "add" ? "Create New Template" : "Edit Template"}
              {/* Debug info */}
              {/* <Typography
                variant="caption"
                sx={{ display: "block", color: "gray" }}
              >
                Mode: {modalMode} | Template:{" "}
                {selectedTemplate?.templateName || "None"}
              </Typography> */}
            </Typography>
            <IconButton onClick={closeModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Template Name */}
              <TextField
                {...register("templateName")}
                label="Template Name"
                fullWidth
                size="small"
                error={!!errors.templateName}
                helperText={
                  errors.templateName?.message
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon sx={{ color: "#457860", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#457860",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#457860",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#457860",
                  },
                }}
              />

              {/* Forms Multi-Select */}
              <Controller
                name="forms"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    size="small"
                    options={forms}
                    getOptionLabel={(option) => option.formName}
                    value={forms.filter((form) =>
                      field.value.includes(form.id)
                    )}
                    onChange={(event, newValue) => {
                      field.onChange(newValue.map((form) => form.id));
                    }}
                    loading={formsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Forms"
                        error={!!errors.forms}
                        helperText={errors.forms?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <AssignmentIcon
                                sx={{ color: "#457860", fontSize: 20 }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover fieldset": {
                              borderColor: "#457860",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#457860",
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#457860",
                          },
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.formName}
                          {...getTagProps({ index })}
                          key={option.id}
                          sx={{
                            borderColor: "#457860",
                            color: "#457860",
                          }}
                        />
                      ))
                    }
                  />
                )}
              />

              {/* Approver Template */}
              <Controller
                name="approverTemplate"
                control={control}
                render={({ field }) => (
                  <FormControl
                    size="small"
                    fullWidth
                    error={!!errors.approverTemplate}
                  >
                    <InputLabel>Approver Template</InputLabel>
                    <Select
                      {...field}
                      label="Approver Template"
                      sx={{
                        borderRadius: 2,
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#457860",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#457860",
                        },
                      }}
                    >
                      {usersLoading ? (
                        <MenuItem disabled>Loading users...</MenuItem>
                      ) : usersError ? (
                        <MenuItem disabled>Error loading users</MenuItem>
                      ) : users.length === 0 ? (
                        <MenuItem disabled>No users available</MenuItem>
                      ) : (
                        users.map((user) => (
                          <MenuItem
                            key={user.id || user._id}
                            value={user.id || user._id}
                          >
                            {user.firstName} {user.lastName}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.approverTemplate && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.approverTemplate.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={closeModal}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#e0e0e0",
                color: "#666",
                "&:hover": {
                  borderColor: "#ccc",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={
                createTemplateMutation.isPending ||
                updateTemplateMutation.isPending
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                backgroundColor: "#457860",
                "&:hover": {
                  backgroundColor: "#2d5a3d",
                },
              }}
            >
              {createTemplateMutation.isPending ||
              updateTemplateMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : modalMode === "add" ? (
                "Create Template"
              ) : (
                "Update Template"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Template Modal */}
      <Dialog
        open={openViewModal}
        onClose={closeViewModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              View Template Details
            </Typography>
            <IconButton onClick={closeViewModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5,mt:1 }}>
            {/* Template Name */}
            <TextField
              label="Template Name"
              value={selectedTemplate?.templateName || ""}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentIcon sx={{ color: "#457860", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                },
              }}
            />

            {/* Forms */}
            <TextField
              label="Associated Forms"
              value={
                selectedTemplate?.forms
                  ?.map((form) => form.formName || form.name)
                  .join(", ") || "No forms associated"
              }
              fullWidth
              size="small"
              multiline
              rows={2}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentIcon sx={{ color: "#457860", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                },
              }}
            />

            {/* Approver Template */}
            <TextField
              label="Approver Template"
              value={
                selectedTemplate?.approverTemplate?.firstName &&
                selectedTemplate?.approverTemplate?.lastName
                  ? `${selectedTemplate.approverTemplate.firstName} ${selectedTemplate.approverTemplate.lastName}`
                  : selectedTemplate?.approverTemplate || "Not assigned"
              }
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#457860", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                },
              }}
            />

            {/* Status */}
            <TextField
              label="Status"
              value={selectedTemplate?.status || "Unknown"}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Chip
                      label={selectedTemplate?.status || "Unknown"}
                      size="small"
                      color={
                        selectedTemplate?.status === "active"
                          ? "success"
                          : "default"
                      }
                      sx={{ mr: 1 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={closeViewModal}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#e0e0e0",
              color: "#666",
              "&:hover": {
                borderColor: "#ccc",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              closeViewModal();
              handleEditTemplate(selectedTemplate);
            }}
            variant="contained"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              backgroundColor: "#457860",
              "&:hover": {
                backgroundColor: "#2d5a3d",
              },
            }}
          >
            Edit Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={closeDeleteModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="error">
              Delete Template
            </Typography>
            <IconButton onClick={closeDeleteModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete the template "
            <strong>{selectedTemplate?.templateName}</strong>"? This action
            cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={closeDeleteModal}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#e0e0e0",
              color: "#666",
              "&:hover": {
                borderColor: "#ccc",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            size="small"
            disabled={deleteTemplateMutation.isPending}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {deleteTemplateMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Delete Template"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Templates;
