import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useForms,
  useDeleteForm,
  useUpdateFormStatus,
} from "../hooks/useForms";
import { formatDistanceToNow } from "date-fns";
import FormStatusToggle from "../components/FormStatusToggle";

const Forms = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

  // Fetch forms
  const { data: formsData, isLoading, error } = useForms();
  const deleteFormMutation = useDeleteForm();
  const updateStatusMutation = useUpdateFormStatus();

  const forms = formsData?.forms || [];

  const handleMenuOpen = (event, form) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedForm(null);
  };

  const handlePreview = (formId) => {
    navigate(`/app/forms/${formId}/preview`);
    handleMenuClose();
  };

  const handleEdit = (formId) => {
    navigate(`/app/form-builder/${formId}`);
    handleMenuClose();
  };

  const handleDelete = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (formToDelete) {
      await deleteFormMutation.mutateAsync(formToDelete._id);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const handleStatusToggle = async (form) => {
    const newStatus = form.status === "active" ? "inactive" : "active";
    await updateStatusMutation.mutateAsync({
      id: form._id,
      status: newStatus,
    });
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "draft":
        return "warning";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">
          {error.message || "Failed to load forms"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Forms
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/app/create-form")}
          sx={{
            backgroundColor: "#457860",
            "&:hover": {
              backgroundColor: "#2d5a3d",
            },
          }}
        >
          Create Form
        </Button>
      </Box>

      {forms.length === 0 ? (
        <Paper elevation={1} sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first form to get started
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/app/create-form")}
            sx={{
              backgroundColor: "#457860",
              "&:hover": {
                backgroundColor: "#2d5a3d",
              },
            }}
          >
            Create Form
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>
                  <strong>Form Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Fields</strong>
                </TableCell>
                <TableCell>
                  <strong>Last Updated</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form._id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {form.formName || "Untitled Form"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormStatusToggle
                      form={form}
                      onStatusChange={(updatedForm) => {
                        // Optionally handle the status change
                        console.log("Form status updated:", updatedForm);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {form.fields?.length || 0} fields
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {form.updatedAt
                        ? formatDistanceToNow(new Date(form.updatedAt)) + " ago"
                        : "Recently created"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handlePreview(form._id)}
                      sx={{
                        borderColor: "#457860",
                        color: "#457860",
                        "&:hover": {
                          borderColor: "#2d5a3d",
                          backgroundColor: "rgba(69, 120, 96, 0.04)",
                        },
                        mr: 1,
                      }}
                    >
                      Preview
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, form)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handlePreview(selectedForm?._id)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedForm?._id)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleStatusToggle(selectedForm)}>
          {selectedForm?.status === "active" ? "Deactivate" : "Activate"}
        </MenuItem>
        <MenuItem
          onClick={() => handleDelete(selectedForm)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "
            {formToDelete?.formName || "this form"}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deleteFormMutation.isLoading}
          >
            {deleteFormMutation.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forms;
