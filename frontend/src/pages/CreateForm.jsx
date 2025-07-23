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
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useForms,
  useCreateForm,
  useUpdateFormName,
  useUpdateFormStatus,
  useDeleteForm,
} from "../hooks/useForms";

// Validation schema for form creation
const createFormSchema = z.object({
  formName: z.string().min(3, "Form name must be at least 3 characters"),
});

// Validation schema for form name editing
const editFormSchema = z.object({
  formName: z.string().min(3, "Form name must be at least 3 characters"),
});

const CreateForm = () => {
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Sorting and pagination states
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

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

  // API hooks
  const {
    data: formsData,
    isLoading,
    error,
    refetch,
  } = useForms({
    page: page + 1, // API uses 1-based pagination
    limit: rowsPerPage,
    search: debouncedSearchTerm,
    sortBy,
    sortOrder: sortDirection,
  });

  const createFormMutation = useCreateForm();
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

  // Form setup for creating new form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm({
    resolver: zodResolver(createFormSchema),
  });

  // Form setup for editing form name
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(editFormSchema),
  });

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

  // Modal handlers
  const handleAddForm = () => {
    resetCreate({
      formName: "",
    });
    setOpenModal(true);
  };

  const handleEditForm = (form) => {
    setSelectedForm(form);
    resetEdit({
      formName: form.formName,
    });
    setOpenEditModal(true);
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

  // Form submission handlers
  const onSubmitCreate = async (data) => {
    try {
      await createFormMutation.mutateAsync(data);
      setOpenModal(false);
      resetCreate();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const onSubmitEdit = async (data) => {
    try {
      await updateFormNameMutation.mutateAsync({
        id: selectedForm.id,
        formName: data.formName,
      });
      setOpenEditModal(false);
      resetEdit();
    } catch (error) {
      // Error is handled by the mutation
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
    resetCreate();
    resetEdit();
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

          {/* Forms Table */}
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{
              overflowX: "auto",
              overflowY: "visible",
            }}
          >
            <Table sx={{ minWidth: { xs: 1200, sm: 1300, md: 1400 } }}>
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
                      Created Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 200, sm: 250 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.map((form) => (
                  <TableRow
                    key={form.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f9f9f9",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "white",
                        zIndex: 5,
                        borderRight: "1px solid #e0e0e0",
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {form.formName}
                      </Typography>
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
                        label=""
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {form.createdBy?.name || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(form.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        <Tooltip title="Form Builder">
                          <IconButton
                            size="small"
                            onClick={() => handleFormBuilder(form)}
                            sx={{ color: "#457860" }}
                          >
                            <BuildIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Form">
                          <IconButton
                            size="small"
                            onClick={() => handleViewForm(form)}
                            sx={{ color: "#1976d2" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Name">
                          <IconButton
                            size="small"
                            onClick={() => handleEditForm(form)}
                            sx={{ color: "#ed6c02" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Form">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteForm(form)}
                            sx={{ color: "#d32f2f" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy URL">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyUrl(form)}
                            sx={{ color: "#9c27b0" }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
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
            rowsPerPageOptions={[rowsPerPage]}
            sx={{
              "& .MuiTablePagination-toolbar": {
                minHeight: 52,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: "0.875rem",
                },
            }}
          />
        </CardContent>
      </Card>

      {/* Add Form Modal */}
      <Dialog
        open={openModal}
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
            <Typography variant="h6" fontWeight="bold">
              Add New Form
            </Typography>
            <IconButton onClick={closeModals} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              {...registerCreate("formName")}
              label="Form Name"
              fullWidth
              size="small"
              error={!!errorsCreate.formName}
              helperText={errorsCreate.formName?.message}
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
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={closeModals} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createFormMutation.isLoading}
              sx={{
                backgroundColor: "#457860",
                "&:hover": {
                  backgroundColor: "#2d5a3d",
                },
                borderRadius: 2,
                px: 3,
              }}
            >
              {createFormMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Create Form"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Form Name Modal */}
      <Dialog
        open={openEditModal}
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
            <Typography variant="h6" fontWeight="bold">
              Edit Form Name
            </Typography>
            <IconButton onClick={closeModals} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              {...registerEdit("formName")}
              label="Form Name"
              fullWidth
              size="small"
              error={!!errorsEdit.formName}
              helperText={errorsEdit.formName?.message}
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
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={closeModals} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateFormNameMutation.isLoading}
              sx={{
                backgroundColor: "#457860",
                "&:hover": {
                  backgroundColor: "#2d5a3d",
                },
                borderRadius: 2,
                px: 3,
              }}
            >
              {updateFormNameMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Update Name"
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
