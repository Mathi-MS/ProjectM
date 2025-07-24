import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import ValidationPanel from "./ValidationPanel";
import { useFormValidation } from "../../hooks/useFormValidation";
import { FIELD_TYPES } from "./constants";

/**
 * Test component to demonstrate the validation system
 */
const ValidationTest = () => {
  const [testFields, setTestFields] = useState([
    {
      id: "field_1",
      name: "firstName",
      type: FIELD_TYPES.TEXT,
      label: "First Name",
      placeholder: "Enter your first name",
      required: true,
      gridSize: 6,
      validations: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      id: "field_2",
      name: "email",
      type: FIELD_TYPES.EMAIL,
      label: "Email Address",
      placeholder: "Enter your email",
      required: true,
      gridSize: 6,
      validations: {
        email: true,
      },
    },
  ]);

  const [invalidFields, setInvalidFields] = useState([
    {
      id: "field_1",
      name: "", // Invalid: empty name
      type: FIELD_TYPES.TEXT,
      label: "", // Invalid: empty label
      placeholder: "",
      required: true,
      gridSize: 15, // Invalid: wrong grid size
    },
    {
      id: "field_2",
      name: "invalid-name", // Invalid: wrong format
      type: FIELD_TYPES.SELECT,
      label: "Select Option",
      placeholder: "Choose option",
      required: true,
      gridSize: 6,
      options: [], // Invalid: empty options
    },
  ]);

  const { isValid, errors, warnings, validateAllFields, clearValidation } =
    useFormValidation({
      validateOnChange: true,
      serverValidation: false,
    });

  const handleValidateValid = async () => {
    await validateAllFields(testFields);
  };

  const handleValidateInvalid = async () => {
    await validateAllFields(invalidFields);
  };

  const handleClear = () => {
    clearValidation();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Field Validation System Test
      </Typography>

      <Typography variant="body1" paragraph>
        This component demonstrates the comprehensive field validation system.
        Use the buttons below to test validation with valid and invalid field
        configurations.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleValidateValid}
        >
          Test Valid Fields
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleValidateInvalid}
        >
          Test Invalid Fields
        </Button>
        <Button variant="outlined" onClick={handleClear}>
          Clear Validation
        </Button>
      </Box>

      {/* Validation Status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Validation Status
        </Typography>
        <Typography
          variant="body2"
          color={isValid ? "success.main" : "error.main"}
        >
          Status: {isValid ? "Valid" : "Invalid"}
        </Typography>
        <Typography variant="body2">Errors: {errors.length}</Typography>
        <Typography variant="body2">Warnings: {warnings.length}</Typography>
      </Paper>

      {/* Validation Panel - Compact Mode */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Validation Panel (Compact)
        </Typography>
        <ValidationPanel
          fields={testFields}
          autoValidate={false}
          serverValidation={false}
          showWarnings={true}
          compact={true}
        />
      </Paper>

      {/* Validation Panel - Full Mode */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Validation Panel (Full)
        </Typography>
        <ValidationPanel
          fields={testFields}
          autoValidate={false}
          serverValidation={false}
          showWarnings={true}
          compact={false}
        />
      </Paper>

      {/* Field Configurations for Reference */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Field Configurations
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Valid Fields:
        </Typography>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(testFields, null, 2)}
        </pre>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Invalid Fields:
        </Typography>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(invalidFields, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
};

export default ValidationTest;
