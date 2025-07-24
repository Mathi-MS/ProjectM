import React, { useState } from "react";
import {
  Switch,
  FormControlLabel,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useUpdateFormStatus } from "../hooks/useForms";
import toast from "react-hot-toast";

const FormStatusToggle = ({ form, onStatusChange }) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const updateStatusMutation = useUpdateFormStatus();

  const handleStatusToggle = (event) => {
    event.stopPropagation();
    const newStatus = form.status === "active" ? "inactive" : "active";
    
    // If trying to activate, check if form has fields
    if (newStatus === "active") {
      if (!form.fields || form.fields.length === 0) {
        // Show validation error dialog
        setPendingStatus(newStatus);
        setConfirmDialogOpen(true);
        return;
      }
    }

    // Proceed with status change
    handleConfirmStatusChange(newStatus);
  };

  const handleConfirmStatusChange = async (newStatus) => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        id: form._id || form.id,
        status: newStatus,
      });
      
      if (onStatusChange) {
        onStatusChange(result.form);
      }
      
      setConfirmDialogOpen(false);
      setPendingStatus(null);
    } catch (error) {
      // Error is already handled by the hook with toast
      setConfirmDialogOpen(false);
      setPendingStatus(null);
    }
  };

  const handleDialogClose = () => {
    setConfirmDialogOpen(false);
    setPendingStatus(null);
  };

  const getStatusDisplay = () => {
    const isActive = form.status === "active";
    const fieldCount = form.fields ? form.fields.length : 0;
    
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={isActive ? <ActiveIcon /> : <InactiveIcon />}
          label={isActive ? "Active" : "Inactive"}
          color={isActive ? "success" : "default"}
          size="small"
        />
        {!isActive && fieldCount === 0 && (
          <Chip
            icon={<WarningIcon />}
            label="No Fields"
            color="warning"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  const canActivate = form.fields && form.fields.length > 0;

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
        {getStatusDisplay()}
        
        <FormControlLabel
          control={
            <Switch
              checked={form.status === "active"}
              onChange={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
              color="success"
            />
          }
          label=""
        />
        
        {updateStatusMutation.isPending && (
          <CircularProgress size={16} />
        )}
      </Box>

      {/* Validation Error Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Cannot Activate Form
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Form Validation Failed</strong>
            </Typography>
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            This form cannot be activated because:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <li>
              <Typography variant="body2">
                The form has no fields configured ({form.fields?.length || 0} fields)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                At least one field is required for a form to be active
              </Typography>
            </li>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>To activate this form:</strong>
              <br />
              1. Go to the Form Builder
              <br />
              2. Add at least one field to the form
              <br />
              3. Save the form
              <br />
              4. Then you can set the status to active
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Navigate to form builder
              window.location.href = `/app/form-builder/${form._id || form.id}`;
            }}
            color="primary"
            variant="contained"
          >
            Open Form Builder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormStatusToggle;