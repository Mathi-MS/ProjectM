import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { FormBuilder as FormBuilderComponent } from "../components/FormBuilder";

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app/create-form");
  };

  const handleSave = () => {
    // This will be called when the form is saved
    navigate("/app/create-form");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header with back button */}
      {/* <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              borderColor: "#457860",
              color: "#457860",
              "&:hover": {
                borderColor: "#2d5a3d",
                backgroundColor: "rgba(69, 120, 96, 0.04)",
              },
            }}
          >
            Back to Forms
          </Button>
          <Typography variant="h5" fontWeight="bold" color="#457860">
            Form Builder
          </Typography>
        </Box>
      </Paper> */}

      {/* Form Builder Content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <FormBuilderComponent formId={formId} onSave={handleSave} />
      </Box>
    </Box>
  );
};

export default FormBuilder;
