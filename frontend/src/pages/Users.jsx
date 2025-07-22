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
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../hooks/useAuth";

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(1, "Last name must be at least 1 character"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: z.enum(["User", "Admin"]).default("User"),
});

const updateUserSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(1, "Last name must be at least 1 character"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["User", "Admin"]),
});

const Users = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'

  // Sorting and pagination states
  const [sortBy, setSortBy] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
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
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page: page + 1, // API uses 1-based pagination
    limit: rowsPerPage,
    search: debouncedSearchTerm,
    sortBy,
    sortOrder: sortDirection,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(
      modalMode === "add" ? createUserSchema : updateUserSchema
    ),
  });

  // Generate avatar props
  const getAvatarProps = (user) => {
    return {
      children: user.firstName.charAt(0).toUpperCase(),
      sx: {
        bgcolor: "#457860",
        color: "white",
        fontSize: "0.875rem",
        fontWeight: "bold",
      },
    };
  };

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
  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    reset({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "User",
    });
    setOpenModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setOpenModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenViewModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handleStatusToggle = async (user) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user._id,
        userData: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: !user.isActive,
        },
      });
      toast.success("User status updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    try {
      if (modalMode === "add") {
        await createUserMutation.mutateAsync(data);
        toast.success("User created successfully!");
      } else {
        await updateUserMutation.mutateAsync({
          id: selectedUser._id,
          userData: data,
        });
        toast.success("User updated successfully!");
      }
      setOpenModal(false);
      reset();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(selectedUser._id);
      setOpenDeleteModal(false);
      // toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
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
          {error.message || "Failed to load users"}
        </Alert>
        <Button onClick={() => refetch()} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {};

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
            Users Management
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
              placeholder="Search users..."
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
              onClick={handleAddUser}
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
              Add User
            </Button>
          </Box>

          {/* Users Table */}
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{
              overflowX: "auto",
              overflowY: "visible",
            }}
          >
            <Table sx={{ minWidth: { xs: 1000, sm: 1100, md: 1200 } }}>
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
                      minWidth: { xs: 180, sm: 200 },
                      whiteSpace: "nowrap",
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#f5f5f5",
                      zIndex: 10,
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    <TableSortLabel
                      active={sortBy === "firstName"}
                      direction={sortBy === "firstName" ? sortDirection : "asc"}
                      onClick={() => handleSort("firstName")}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: "#457860 !important",
                        },
                      }}
                    >
                      User
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      minWidth: { xs: 200, sm: 250 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      active={sortBy === "email"}
                      direction={sortBy === "email" ? sortDirection : "asc"}
                      onClick={() => handleSort("email")}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: "#457860 !important",
                        },
                      }}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: 100,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      minWidth: { xs: 120, sm: 140 },
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
                      cursor: "pointer",
                      minWidth: { xs: 120, sm: 140 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      minWidth: { xs: 120, sm: 140 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user._id}
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar {...getAvatarProps(user)} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <EmailIcon sx={{ color: "#666", fontSize: 16 }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          backgroundColor:
                            user.role === "Admin" ? "#e3f2fd" : "#f3e5f5",
                          color: user.role === "Admin" ? "#1976d2" : "#7b1fa2",
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isActive}
                            onChange={() => handleStatusToggle(user)}
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
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                            sx={{ color: "#457860" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user)}
                            sx={{ color: "#d32f2f" }}
                          >
                            <DeleteIcon fontSize="small" />
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
            count={pagination.totalUsers || 0}
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

      {/* Add/Edit User Modal */}
      <Dialog
        open={openModal}
        onClose={closeModal}
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
              {modalMode === "add" ? "Add New User" : "Edit User"}
            </Typography>
            <IconButton onClick={closeModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* First Name and Last Name Row */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  {...register("firstName")}
                  label="First Name"
                  fullWidth
                  size="small"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#457860", fontSize: 20 }} />
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
                <TextField
                  {...register("lastName")}
                  label="Last Name"
                  fullWidth
                  size="small"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#457860", fontSize: 20 }} />
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
              </Box>

              {/* Email */}
              <TextField
                {...register("email")}
                label="Email Address"
                type="email"
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#457860", fontSize: 20 }} />
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

              {/* Password - only show for add mode */}
              {modalMode === "add" && (
                <TextField
                  {...register("password")}
                  label="Password"
                  type="password"
                  fullWidth
                  size="small"
                  error={!!errors.password}
                  helperText={errors.password?.message}
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

              {/* Role */}
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  {...register("role")}
                  label="Role"
                  error={!!errors.role}
                  defaultValue="User"
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
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
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
                createUserMutation.isLoading || updateUserMutation.isLoading
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
              {createUserMutation.isLoading || updateUserMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : modalMode === "add" ? (
                "Add User"
              ) : (
                "Update User"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View User Modal */}
      <Dialog
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
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
              User Details
            </Typography>
            <IconButton onClick={() => setOpenViewModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
            >
              {/* Profile Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Avatar
                  {...getAvatarProps(selectedUser)}
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                    ...getAvatarProps(selectedUser).sx,
                  }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User Profile
                  </Typography>
                </Box>
              </Box>

              {/* User Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    First Name:
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.firstName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    Last Name:
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.lastName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    Email:
                  </Typography>
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    Role:
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    size="small"
                    sx={{
                      backgroundColor:
                        selectedUser.role === "Admin" ? "#e3f2fd" : "#f3e5f5",
                      color:
                        selectedUser.role === "Admin" ? "#1976d2" : "#7b1fa2",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    Created Date:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedUser.createdAt)}
                  </Typography>
                </Box>
                {selectedUser.lastLogin && (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      Last Login:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedUser.lastLogin)}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    Status:
                  </Typography>
                  <Chip
                    label={selectedUser.isActive ? "Active" : "Inactive"}
                    color={selectedUser.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenViewModal(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="error">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body1">
                Are you sure you want to delete user{" "}
                <strong>
                  {selectedUser.firstName} {selectedUser.lastName}
                </strong>
                ?
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This action cannot be undone.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenDeleteModal(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteUserMutation.isLoading}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {deleteUserMutation.isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete User"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
