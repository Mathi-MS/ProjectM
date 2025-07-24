import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useFormValidation } from "../../hooks/useFormValidation";

/**
 * ValidationPanel component for displaying form validation results
 * @param {Object} props - Component props
 * @param {Array} props.fields - Array of field configurations
 * @param {Object} props.formData - Complete form data
 * @param {Function} props.onValidationChange - Callback when validation state changes
 * @param {boolean} props.autoValidate - Whether to auto-validate on changes
 * @param {boolean} props.serverValidation - Whether to use server-side validation
 * @param {boolean} props.showWarnings - Whether to show warnings
 * @param {boolean} props.compact - Whether to use compact display
 */
const ValidationPanel = ({
  fields = [],
  formData = null,
  onValidationChange,
  autoValidate = true,
  serverValidation = false,
  showWarnings = true,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState({
    errors: true,
    warnings: false,
    summary: false,
  });

  const {
    validationState,
    isValid,
    errors,
    warnings,
    fieldErrors,
    isValidating,
    lastValidated,
    validateAllFields,
    validateFormData,
    validateDependencies,
    validateSteps,
  } = useFormValidation({
    validateOnChange: autoValidate,
    serverValidation,
  });

  // Auto-validate when fields change
  useEffect(() => {
    if (autoValidate && fields.length > 0) {
      if (formData) {
        validateFormData(formData);
      } else {
        validateAllFields(fields);
      }
    }
  }, [fields, formData, autoValidate, validateAllFields, validateFormData]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationState);
    }
  }, [validationState, onValidationChange]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

  const handleManualValidation = async () => {
    if (formData) {
      await validateFormData(formData);
    } else {
      await validateAllFields(fields, true);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <CircularProgress size={20} />;
    }
    if (errors.length > 0) {
      return <ErrorIcon color="error" />;
    }
    if (warnings.length > 0) {
      return <WarningIcon color="warning" />;
    }
    return <CheckCircleIcon color="success" />;
  };

  const getValidationStatus = () => {
    if (isValidating) return "Validating...";
    if (errors.length > 0) return "Validation Failed";
    if (warnings.length > 0) return "Validation Passed with Warnings";
    return "Validation Passed";
  };

  const getValidationColor = () => {
    if (errors.length > 0) return "error";
    if (warnings.length > 0) return "warning";
    return "success";
  };

  // Validate dependencies and steps
  const dependencyValidation = validateDependencies(fields);
  const stepValidation = validateSteps(fields);

  if (compact) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {getValidationIcon()}
        <Typography variant="body2" color={getValidationColor()}>
          {getValidationStatus()}
        </Typography>
        {errors.length > 0 && (
          <Chip
            label={`${errors.length} error${errors.length !== 1 ? "s" : ""}`}
            color="error"
            size="small"
          />
        )}
        {showWarnings && warnings.length > 0 && (
          <Chip
            label={`${warnings.length} warning${
              warnings.length !== 1 ? "s" : ""
            }`}
            color="warning"
            size="small"
          />
        )}
        <Tooltip title="Refresh validation">
          <IconButton
            size="small"
            onClick={handleManualValidation}
            disabled={isValidating}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getValidationIcon()}
          <Typography variant="h6">Form Validation</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {lastValidated && (
            <Typography variant="caption" color="text.secondary">
              Last validated: {lastValidated.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={handleManualValidation}
            disabled={isValidating}
            startIcon={
              isValidating ? <CircularProgress size={16} /> : <RefreshIcon />
            }
          >
            {isValidating ? "Validating..." : "Validate"}
          </Button>
        </Box>
      </Box>

      <Alert severity={getValidationColor()} sx={{ mb: 2 }}>
        <AlertTitle>{getValidationStatus()}</AlertTitle>
        {fields.length > 0 ? (
          <Typography variant="body2">
            {errors.length === 0 && warnings.length === 0
              ? `All ${fields.length} field${
                  fields.length !== 1 ? "s" : ""
                } are valid.`
              : `Found ${errors.length} error${
                  errors.length !== 1 ? "s" : ""
                } and ${warnings.length} warning${
                  warnings.length !== 1 ? "s" : ""
                } in ${fields.length} field${fields.length !== 1 ? "s" : ""}.`}
          </Typography>
        ) : (
          <Typography variant="body2">No fields to validate.</Typography>
        )}
      </Alert>

      {/* Errors Section */}
      {errors.length > 0 && (
        <Accordion
          expanded={expanded.errors}
          onChange={handleAccordionChange("errors")}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ErrorIcon color="error" />
              <Typography variant="subtitle1">
                Errors ({errors.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {errors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Warnings Section */}
      {showWarnings && warnings.length > 0 && (
        <Accordion
          expanded={expanded.warnings}
          onChange={handleAccordionChange("warnings")}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="subtitle1">
                Warnings ({warnings.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={warning} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Summary Section */}
      <Accordion
        expanded={expanded.summary}
        onChange={handleAccordionChange("summary")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InfoIcon color="info" />
            <Typography variant="subtitle1">Validation Summary</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Basic Stats */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Field Statistics
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${fields.length} Total Fields`}
                  variant="outlined"
                />
                <Chip
                  label={`${
                    fields.length - Object.keys(fieldErrors).length
                  } Valid Fields`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`${
                    Object.keys(fieldErrors).length
                  } Fields with Errors`}
                  color="error"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider />

            {/* Dependency Validation */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Field Dependencies
              </Typography>
              {dependencyValidation.isValid ? (
                <Alert severity="success" variant="outlined">
                  All field dependencies are valid
                </Alert>
              ) : (
                <Alert severity="error" variant="outlined">
                  <List dense>
                    {dependencyValidation.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Step Validation */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Form Steps
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <Chip
                  label={`${stepValidation.steps} Step${
                    stepValidation.steps !== 1 ? "s" : ""
                  }`}
                  variant="outlined"
                />
              </Box>
              {stepValidation.warnings.length > 0 && (
                <Alert severity="warning" variant="outlined">
                  <List dense>
                    {stepValidation.warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default ValidationPanel;
