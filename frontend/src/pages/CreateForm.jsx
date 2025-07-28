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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Build as BuildIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useForms,
  useCreateForm,
  useUpdateForm,
  useUpdateFormName,
  useUpdateFormStatus,
  useDeleteForm,
} from "../hooks/useForms";
import { useUsers } from "../hooks/useAuth";
import UserChip from "../components/UserChip";

// Validation schema for form creation
const createFormSchema = z.object({
  formName: z.string().min(3, "Form name must be at least 3 characters"),
  initiator: z.string().min(1, "Initiator is required"),
  reviewer: z.string().min(1, "Reviewer is required"),
  approver: z.string().min(1, "Approver is required"),
});

// Validation schema for form editing (same as create but without required new fields if not changed)
const editFormSchema = z.object({
  formName: z.string().min(3, "Form name must be at least 3 characters"),
  initiator: z.string().min(1, "Initiator is required"),
  reviewer: z.string().min(1, "Reviewer is required"),
  approver: z.string().min(1, "Approver is required"),
});

const CreateForm = () => {
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'

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
    resolver: zodResolver(
      modalMode === "add" ? createFormSchema : editFormSchema
    ),
    defaultValues: {
      formName: "",
      initiator: "",
      reviewer: "",
      approver: "",
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
    if (modalMode === "edit" && selectedForm && openModal) {
      const formData = {
        formName: selectedForm.formName || "",
        initiator:
          selectedForm.initiator?.id ||
          selectedForm.initiator?._id ||
          selectedForm.initiator ||
          "",
        reviewer:
          selectedForm.reviewer?.id ||
          selectedForm.reviewer?._id ||
          selectedForm.reviewer ||
          "",
        approver:
          selectedForm.approver?.id ||
          selectedForm.approver?._id ||
          selectedForm.approver ||
          "",
      };

      console.log("useEffect - Setting form values:", formData); // Debug log
      console.log("Selected form data:", selectedForm); // Additional debug log
      console.log("Initiator data:", selectedForm.initiator); // Debug initiator
      console.log("Reviewer data:", selectedForm.reviewer); // Debug reviewer
      console.log("Approver data:", selectedForm.approver); // Debug approver

      // Use setTimeout to ensure the modal is fully rendered before setting values
      setTimeout(() => {
        // Use both reset and setValue for better reliability
        reset(formData);

        // Also set individual values as backup
        setValue("formName", formData.formName);
        setValue("initiator", formData.initiator);
        setValue("reviewer", formData.reviewer);
        setValue("approver", formData.approver);
      }, 100); // Increased timeout to ensure proper rendering
    }
  }, [modalMode, selectedForm, openModal, reset, setValue]);

  // Additional effect to handle form reset when modal closes
  useEffect(() => {
    if (!openModal) {
      // Reset form when modal closes
      reset({
        formName: "",
        initiator: "",
        reviewer: "",
        approver: "",
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


  const { data: formsData, isLoading, error, refetch } = useForms(apiParams);

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

  const createFormMutation = useCreateForm();
  const updateFormMutation = useUpdateForm();
  const updateFormNameMutation = useUpdateFormName();
  const updateFormStatusMutation = useUpdateFormStatus();
  const deleteFormMutation = useDeleteForm();

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
  const handleAddForm = () => {
    setModalMode("add");
    setSelectedForm(null);
    reset({
      formName: "",
      initiator: "",
      reviewer: "",
      approver: "",
    });
    setOpenModal(true);
  };

  const handleEditForm = (form) => {
    setModalMode("edit");
    setSelectedForm(form);

    // Clear form first, then open modal
    reset({
      formName: "",
      initiator: "",
      reviewer: "",
      approver: "",
    });

    setOpenModal(true);
  };

  const handleDeleteForm = (form) => {
    setSelectedForm(form);
    setOpenDeleteModal(true);
  };

  const handleFormBuilder = (form) => {
    // Navigate to form builder with form ID
    navigate(`/app/form-builder/${form.id}`);
  };

  const handleViewForm = (form) => {
    // Navigate to form preview/view
    navigate(`/app/forms/${form.id}/preview`);
  };

  const handleCopyUrl = (form) => {
    const url = `${window.location.origin}/forms/${form.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Form URL copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy URL");
      });
  };

  const handleStatusToggle = async (form) => {
    try {
      const newStatus = form.status === "active" ? "inactive" : "active";
      await updateFormStatusMutation.mutateAsync({
        id: form.id,
        status: newStatus,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Form submission handler - unified for both add and edit
  const onSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await createFormMutation.mutateAsync(data);
      } else {
        await updateFormMutation.mutateAsync({
          id: selectedForm.id,
          formData: {
            formName: data.formName,
            initiator: data.initiator,
            reviewer: data.reviewer,
            approver: data.approver,
          },
        });
      }
      setOpenModal(false);
      reset();
    } catch (error) {

    }
  };

  const confirmDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync(selectedForm.id);
      setOpenDeleteModal(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const closeModals = () => {
    setOpenModal(false);
    setOpenEditModal(false);
    setOpenDeleteModal(false);
    reset();
  };

  const closeModal = () => {
    setOpenModal(false);
    reset();
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
          {error.message || "Failed to load forms"}
        </Alert>
        <Button onClick={() => refetch()} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  const forms = formsData?.forms || [];
  const pagination = formsData?.pagination || {};
  const users = usersData?.users || [];

  // Debug logs
  console.log("Forms data:", formsData);
  console.log("Pagination data:", pagination);
  console.log("Current page:", page, "Rows per page:", rowsPerPage);
  console.log("Total forms:", pagination.total);
  console.log("Forms array length:", forms.length);
  console.log("Forms array:", forms);
  console.log("Expected forms on this page:", rowsPerPage);
  console.log("API should return:", rowsPerPage, "forms for page", page + 1);

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
            Forms Management
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
              placeholder="Search forms..."
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
                    <SearchIcon sx={{ color: "#457860" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* <Button
                variant="outlined"
                onClick={() => {
                  console.log("Manual refetch triggered");
                  refetch();
                }}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button> */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddForm}
                sx={{
                  backgroundColor: "#457860",
                  "&:hover": {
                    backgroundColor: "#2d5a3d",
                  },
                  borderRadius: 2,
                  px: 3,
                  minWidth: { sm: "auto" },
                }}
              >
                Add Form
              </Button>
            </Box>
          </Box>

          {/* Pagination Summary */}
          {pagination.total > 0 && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {Math.min(page * rowsPerPage + 1, pagination.total)} to{" "}
                {Math.min((page + 1) * rowsPerPage, pagination.total)} of{" "}
                {pagination.total} forms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Page {page + 1} of {Math.ceil(pagination.total / rowsPerPage)}
              </Typography>
            </Box>
          )}

          {/* Forms Table */}
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{
              overflowX: "auto",
              overflowY: "visible",
            }}
          >
            <Table sx={{ minWidth: { xs: 1600, sm: 1700, md: 1800 } }}>
              <TableHead
                sx={{
                  "& th .MuiButtonBase-root": {
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      minWidth: { xs: 200, sm: 250 },
                      whiteSpace: "nowrap",
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#f5f5f5",
                      zIndex: 10,
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    <TableSortLabel
                      active={sortBy === "formName"}
                      direction={sortBy === "formName" ? sortDirection : "asc"}
                      onClick={() => handleSort("formName")}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: "#457860 !important",
                        },
                      }}
                    >
                      Form Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: 120,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 180, sm: 200 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Created By
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 150, sm: 180 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Initiator
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 150, sm: 180 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Reviewer
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 150, sm: 180 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Approver
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      minWidth: { xs: 150, sm: 180 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortDirection : "asc"}
                      onClick={() => handleSort("createdAt")}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: "#457860 !important",
                        },
                      }}
                    >
                      Created At
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 220, sm: 250 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {debouncedSearchTerm
                          ? `No forms found matching "${debouncedSearchTerm}"`
                          : "No forms available. Create your first form!"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <TableRow
                      key={form.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f8f9fa",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "medium",
                          position: "sticky",
                          left: 0,
                          backgroundColor: "white",
                          zIndex: 5,
                          borderRight: "1px solid #e0e0e0",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              color: "#1976d2",
                              cursor: "pointer",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                            onClick={() => handleViewForm(form)}
                          >
                            {form.formName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.status === "active"}
                              onChange={() => handleStatusToggle(form)}
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
                              label={form.status}
                              size="small"
                              sx={{
                                backgroundColor:
                                  form.status === "active"
                                    ? "#e8f5e8"
                                    : "#ffebee",
                                color:
                                  form.status === "active"
                                    ? "#2e7d32"
                                    : "#c62828",
                                fontSize: "0.75rem",
                                height: "20px",
                                textTransform: "capitalize",
                              }}
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <UserChip user={form.createdBy} />
                      </TableCell>
                      <TableCell>
                        <UserChip user={form.initiator} />
                      </TableCell>
                      <TableCell>
                        <UserChip user={form.reviewer} />
                      </TableCell>
                      <TableCell>
                        <UserChip user={form.approver} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(form.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Form Builder">
                            <IconButton
                              size="small"
                              onClick={() => handleFormBuilder(form)}
                              sx={{
                                color: "#457860",
                                "&:hover": {
                                  backgroundColor: "rgba(69, 120, 96, 0.04)",
                                },
                              }}
                            >
                              <BuildIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Preview Form">
                            <IconButton
                              size="small"
                              onClick={() => handleViewForm(form)}
                              sx={{
                                color: "#1976d2",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                                },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* <Tooltip title="Copy URL">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyUrl(form)}
                              sx={{
                                color: "#9c27b0",
                                "&:hover": {
                                  backgroundColor: "rgba(156, 39, 176, 0.04)",
                                },
                              }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip> */}
                          <Tooltip title="Edit Name">
                            <IconButton
                              size="small"
                              onClick={() => handleEditForm(form)}
                              sx={{
                                color: "#ed6c02",
                                "&:hover": {
                                  backgroundColor: "rgba(237, 108, 2, 0.04)",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Form">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteForm(form)}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": {
                                  backgroundColor: "rgba(211, 47, 47, 0.04)",
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
          <TablePagination
            component="div"
            count={pagination.totalForms || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              mt: 2,
              "& .MuiTablePagination-toolbar": {
                paddingLeft: 0,
                paddingRight: 0,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: "0.875rem",
                },
            }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
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
              {modalMode === "add" ? "Create New Form" : "Edit Form"}
            </Typography>
            <IconButton onClick={closeModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form
          key={`${modalMode}-${selectedForm?.id || "new"}`}
          onSubmit={handleSubmit(onSubmit)}
        >
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Form Name */}
              <TextField
                {...register("formName")}
                label="Form Name"
                fullWidth
                size="small"
                error={!!errors.formName}
                helperText={errors.formName?.message}
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

              {/* Initiator */}
              <Controller
                name="initiator"
                control={control}
                render={({ field }) => {
                  console.log("Initiator field value:", field.value); // Debug log
                  return (
                    <FormControl size="small" fullWidth>
                      <InputLabel>Initiator</InputLabel>
                      <Select
                        {...field}
                        label="Initiator"
                        error={!!errors.initiator}
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
                      {errors.initiator && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.initiator.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />

              {/* Reviewer */}
              <Controller
                name="reviewer"
                control={control}
                render={({ field }) => {
                  console.log("Reviewer field value:", field.value); // Debug log
                  return (
                    <FormControl size="small" fullWidth>
                      <InputLabel>Reviewer</InputLabel>
                      <Select
                        {...field}
                        label="Reviewer"
                        error={!!errors.reviewer}
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
                      {errors.reviewer && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.reviewer.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />

              {/* Approver */}
              <Controller
                name="approver"
                control={control}
                render={({ field }) => {
                  console.log("Approver field value:", field.value); // Debug log
                  return (
                    <FormControl size="small" fullWidth>
                      <InputLabel>Approver</InputLabel>
                      <Select
                        {...field}
                        label="Approver"
                        error={!!errors.approver}
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
                      {errors.approver && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {errors.approver.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={closeModal} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createFormMutation.isLoading || updateFormMutation.isLoading
              }
              sx={{
                backgroundColor: "#457860",
                "&:hover": {
                  backgroundColor: "#2d5a3d",
                },
                borderRadius: 2,
                px: 3,
              }}
            >
              {createFormMutation.isLoading || updateFormMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : modalMode === "add" ? (
                "Create Form"
              ) : (
                "Update Form"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={closeModals}
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
              Delete Form
            </Typography>
            <IconButton onClick={closeModals} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete the form "{selectedForm?.formName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={closeModals} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleteFormMutation.isLoading}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            {deleteFormMutation.isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateForm;
