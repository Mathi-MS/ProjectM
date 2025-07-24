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
import { useUsers } from "../hooks/useAuth";
import UserChip from "../components/UserChip";

// Validation schema for form creation
const createFormSchema = z.object({
  formName: z.string().min(3, "Form name must be at least 3 characters"),
  initiator: z.string().min(1, "Initiator is required"),
  reviewer: z.string().min(1, "Reviewer is required"),
  approver: z.string().min(1, "Approver is required"),
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

  // Temporary fix for role field state variables
  const [reviewer, setReviewer] = useState("");
  const [approver, setApprover] = useState("");

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
    watch,
    setValue,
    formState: { errors: errorsCreate },
  } = useForm({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      formName: "",
      initiator: "",
      reviewer: "",
      approver: "",
    },
  });
  console.log(errorsCreate, "qwdqwd");
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
      initiator: "",
      reviewer: "",
      approver: "",
    });
    setReviewer("");
    setApprover("");
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
      const formData = {
        ...data,
        reviewer,
        approver,
      };
      await createFormMutation.mutateAsync(formData);
      setOpenModal(false);
      resetCreate();
      setReviewer("");
      setApprover("");
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
    setReviewer("");
    setApprover("");
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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

              {/* Initiator Select */}
              <FormControl
                size="small"
                fullWidth
                error={!!errorsCreate.initiator}
              >
                <InputLabel>Initiator</InputLabel>
                <Select
                  {...registerCreate("initiator")}
                    label="Initiator"
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography
                            color="textSecondary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Select an initiator...
                          </Typography>
                        );
                      }
                      const user = users.find((u) => u._id === selected);
                      if (!user) return selected;
                      return (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                          >
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      );
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                          "& .MuiMenuItem-root": {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      <em>None</em>
                    </MenuItem>
                    {usersLoading ? (
                      <MenuItem disabled>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} />
                          <Typography>Loading users...</Typography>
                        </Box>
                      </MenuItem>
                    ) : usersError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading users
                        </Typography>
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="textSecondary">
                          No users available
                        </Typography>
                      </MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                            >
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Reviewer Select */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Reviewer</InputLabel>
                  <Select
                    value={reviewer || ""}
                    onChange={(e) => setReviewer(e.target.value || null)}
                    label="Reviewer"
                    sx={{
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography
                            color="textSecondary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Select a reviewer...
                          </Typography>
                        );
                      }
                      const user = users.find((u) => u._id === selected);
                      if (!user) return selected;
                      return (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                          >
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      );
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                          "& .MuiMenuItem-root": {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      <em>None</em>
                    </MenuItem>
                    {usersLoading ? (
                      <MenuItem disabled>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} />
                          <Typography>Loading users...</Typography>
                        </Box>
                      </MenuItem>
                    ) : usersError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading users
                        </Typography>
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="textSecondary">
                          No users available
                        </Typography>
                      </MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                            >
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Approver Select */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Approver</InputLabel>
                  <Select
                    value={approver || ""}
                    onChange={(e) => setApprover(e.target.value || null)}
                    label="Approver"
                    sx={{
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography
                            color="textSecondary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Select an approver...
                          </Typography>
                        );
                      }
                      const user = users.find((u) => u._id === selected);
                      if (!user) return selected;
                      return (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                          >
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      );
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                          "& .MuiMenuItem-root": {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      <em>None</em>
                    </MenuItem>
                    {usersLoading ? (
                      <MenuItem disabled>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} />
                          <Typography>Loading users...</Typography>
                        </Box>
                      </MenuItem>
                    ) : usersError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading users
                        </Typography>
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="textSecondary">
                          No users available
                        </Typography>
                      </MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                            >
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Reviewer Select */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Reviewer</InputLabel>
                  <Select
                    value={reviewer || ""}
                    onChange={(e) => setReviewer(e.target.value || null)}
                    label="Reviewer"
                    sx={{
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography
                            color="textSecondary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Select a reviewer...
                          </Typography>
                        );
                      }
                      const user = users.find((u) => u._id === selected);
                      if (!user) return selected;
                      return (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                          >
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      );
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                          "& .MuiMenuItem-root": {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      <em>None</em>
                    </MenuItem>
                    {usersLoading ? (
                      <MenuItem disabled>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} />
                          <Typography>Loading users...</Typography>
                        </Box>
                      </MenuItem>
                    ) : usersError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading users
                        </Typography>
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="textSecondary">
                          No users available
                        </Typography>
                      </MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                            >
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Approver Select */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Approver</InputLabel>
                  <Select
                    value={approver || ""}
                    onChange={(e) => setApprover(e.target.value || null)}
                    label="Approver"
                    sx={{
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#457860",
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography
                            color="textSecondary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Select an approver...
                          </Typography>
                        );
                      }
                      const user = users.find((u) => u._id === selected);
                      if (!user) return selected;
                      return (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                          >
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      );
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                          "& .MuiMenuItem-root": {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{ fontStyle: "italic", color: "text.secondary" }}
                    >
                      <em>None</em>
                    </MenuItem>
                    {usersLoading ? (
                      <MenuItem disabled>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} />
                          <Typography>Loading users...</Typography>
                        </Box>
                      </MenuItem>
                    ) : usersError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading users
                        </Typography>
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="textSecondary">
                          No users available
                        </Typography>
                      </MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                            >
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
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
