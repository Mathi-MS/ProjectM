import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useForm as useReactHookForm } from "react-hook-form";
import { FormRenderer } from "../components/FormBuilder";
import {
  generateFormSteps,
  serializeFormData,
} from "../components/FormBuilder/utils";
import { FIELD_TYPES } from "../components/FormBuilder/constants";
import { useForm } from "../hooks/useForms";

const FormPreview = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);

  // Responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Load form data
  const { data: formData, isLoading, error } = useForm(formId);

  // Debug logging
  console.log("FormPreview - formData:", formData);
  console.log("FormPreview - formId:", formId);

  // React Hook Form for preview
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = useReactHookForm({
    mode: "onChange",
  });

  // Check if form data exists and has fields
  const fields = formData?.fields || [];
  const hasFields = fields.length > 0;

  // Generate steps from fields
  const steps = generateFormSteps(fields);
  const currentStepFields = steps[activeStep]?.fields || [];
  const isLastStep = activeStep === steps.length - 1;

  const handleBack = () => {
    // Navigate back to forms table view
    navigate("/app/create-form", { replace: true });
  };

  const handleStepNext = async (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validate current step fields
    const currentFieldNames = currentStepFields
      .filter(
        (field) =>
          field.type !== FIELD_TYPES.HEADER &&
          field.type !== FIELD_TYPES.PARAGRAPH &&
          field.type !== FIELD_TYPES.STEP &&
          field.type !== FIELD_TYPES.DIVIDER &&
          field.type !== FIELD_TYPES.SPACER
      )
      .map((field) => field.name);

    const isValid = await trigger(currentFieldNames);

    if (isValid) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
    }
  };

  const handleStepBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSubmittedData(null);
    setPreviewData({});
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data);

    // Only submit if we're on the last step
    if (isLastStep) {
      // Serialize form data to handle File objects properly
      const serializedData = serializeFormData(data);
      setSubmittedData(serializedData);
      setPreviewData(serializedData);
    } else {
      console.log("Preventing submission - not on last step");
      return false;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || "Failed to load form"}
        </Alert>
        <Button onClick={handleBack} variant="contained">
          Back to Forms
        </Button>
      </Box>
    );
  }

  // Show submitted data if form was submitted successfully
  if (submittedData) {
    return (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header with back button */}
        <Paper
          elevation={1}
          sx={{
            p: isMobile ? 1.5 : 2,
            borderRadius: 0,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 1 : 2,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              size={isMobile ? "small" : "medium"}
              sx={{
                borderColor: "#457860",
                color: "#457860",
                "&:hover": {
                  borderColor: "#2d5a3d",
                  backgroundColor: "rgba(69, 120, 96, 0.04)",
                },
                alignSelf: isMobile ? "flex-start" : "center",
              }}
            >
              {isMobile ? "Back" : "Back to Forms"}
            </Button>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="bold"
              color="#457860"
              sx={{
                wordBreak: "break-word",
                lineHeight: 1.2,
              }}
            >
              Form Submitted Successfully!
            </Typography>
          </Box>
        </Paper>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "#f8f9fa",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            p: isMobile ? 1 : isTablet ? 2 : 3,
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 800, width: "100%" }}>
            <Typography variant="h5" gutterBottom color="success.main">
              ✅ Form Submitted Successfully!
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Submitted Data:
            </Typography>

            <Paper sx={{ p: 2, backgroundColor: "grey.50", overflow: "auto" }}>
              <pre style={{ margin: 0, fontSize: "0.875rem" }}>
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </Paper>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button variant="contained" onClick={handleReset}>
                Reset Form
              </Button>
              <Button variant="outlined" onClick={handleBack}>
                Back to Forms
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header with back button */}
      <Paper
        elevation={1}
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 1 : 2,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderColor: "#457860",
              color: "#457860",
              "&:hover": {
                borderColor: "#2d5a3d",
                backgroundColor: "rgba(69, 120, 96, 0.04)",
              },
              alignSelf: isMobile ? "flex-start" : "center",
            }}
          >
            {isMobile ? "Back" : "Back to Forms"}
          </Button>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="bold"
            color="#457860"
            sx={{
              wordBreak: "break-word",
              lineHeight: 1.2,
            }}
          >
            Form Preview: {formData?.formName || "Untitled Form"}
          </Typography>
        </Box>
      </Paper>

      {/* Form Preview Content - Builder Style */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: isMobile ? 1 : isTablet ? 2 : 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: isMobile ? "100%" : 1200,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 3,
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {/* Form Canvas - Like Form Builder */}
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: isMobile ? 2 : 3,
              backgroundColor: "white",
              borderRadius: 2,
              minHeight: isMobile ? 400 : 600,
              order: isMobile ? 2 : 1,
            }}
          >
            {!hasFields ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: isMobile ? 4 : 8,
                  px: isMobile ? 2 : 4,
                  border: "2px dashed #ddd",
                  borderRadius: 1,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  color="text.secondary"
                  gutterBottom
                >
                  This form has no fields yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Add some fields to the form to see the preview
                </Typography>
                <Button
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  onClick={() => navigate(`/app/form-builder/${formId}`)}
                  sx={{
                    backgroundColor: "#457860",
                    "&:hover": {
                      backgroundColor: "#2d5a3d",
                    },
                  }}
                >
                  Edit Form
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  Form Preview
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fields: {fields.length} | Steps: {steps.length} | Current:{" "}
                  {currentStepFields.length}
                </Typography>

                {/* Stepper for multi-step forms */}
                {steps.length > 1 && (
                  <Box sx={{ mb: 4 }}>
                    <Stepper
                      activeStep={activeStep}
                      alternativeLabel={!isMobile}
                      orientation={isMobile ? "vertical" : "horizontal"}
                    >
                      {steps.map((step, index) => (
                        <Step key={index}>
                          <StepLabel>{step.title}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  {steps.length > 1 && (
                    <Typography variant="h6" gutterBottom>
                      {steps[activeStep]?.title}
                    </Typography>
                  )}

                  <FormRenderer
                    fields={currentStepFields}
                    control={control}
                    errors={errors}
                    watch={watch}
                    disabled={false}
                  />
                </Box>

                {/* Step Navigation */}
                {steps.length > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 4,
                      mb: 2,
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? 2 : 0,
                    }}
                  >
                    <Button
                      type="button"
                      disabled={activeStep === 0}
                      onClick={handleStepBack}
                      variant="outlined"
                      size={isMobile ? "large" : "medium"}
                      fullWidth={isMobile}
                      sx={{
                        borderColor: "#457860",
                        color: "#457860",
                        "&:hover": {
                          borderColor: "#2d5a3d",
                          backgroundColor: "rgba(69, 120, 96, 0.04)",
                        },
                      }}
                    >
                      Back
                    </Button>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: isMobile ? "center" : "flex-end",
                      }}
                    >
                      {!isLastStep ? (
                        <Button
                          type="button"
                          onClick={handleStepNext}
                          variant="contained"
                          size={isMobile ? "large" : "medium"}
                          fullWidth={isMobile}
                          sx={{
                            backgroundColor: "#457860",
                            "&:hover": {
                              backgroundColor: "#2d5a3d",
                            },
                          }}
                        >
                          Next
                        </Button>
                      ) : null}
                    </Box>
                  </Box>
                )}

                {/* Show validation errors */}
                {Object.keys(errors).length > 0 && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    Please fix the errors above before proceeding.
                  </Alert>
                )}
                {/* Test Form Section at the bottom - Only show on last step or single step forms */}
                {(steps.length === 1 || isLastStep) && (
                  <Box
                    sx={{
                      mt: isMobile ? 3 : 4,
                      pt: isMobile ? 2 : 3,
                      borderTop: "2px solid #457860",
                      backgroundColor: "#f8f9fa",
                      borderRadius: 2,
                      p: isMobile ? 2 : 3,
                    }}
                  >
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      gutterBottom
                      sx={{
                        color: "#457860",
                        fontWeight: "bold",
                        textAlign: "center",
                        mb: isMobile ? 1.5 : 2,
                      }}
                    >
                      🧪 Test Form Submission
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        mb: isMobile ? 2 : 3,
                        px: isMobile ? 1 : 0,
                      }}
                    >
                      {steps.length > 1
                        ? "You've reached the final step! Click below to submit the form."
                        : "Click the button below to test your form submission and see the results"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: isMobile ? 1.5 : 2,
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size={isMobile ? "medium" : "large"}
                        fullWidth={isMobile}
                        sx={{
                          backgroundColor: "#457860",
                          "&:hover": {
                            backgroundColor: "#2d5a3d",
                          },
                          px: isMobile ? 4 : 8,
                          py: isMobile ? 1.5 : 2,
                          borderRadius: 3,
                          fontWeight: "bold",
                          fontSize: isMobile ? "1rem" : "1.1rem",
                          boxShadow: "0 4px 12px rgba(69, 120, 96, 0.3)",
                          "&:hover": {
                            backgroundColor: "#2d5a3d",
                            boxShadow: "0 6px 16px rgba(69, 120, 96, 0.4)",
                          },
                          maxWidth: isMobile ? "none" : "400px",
                        }}
                      >
                        🚀{" "}
                        {steps.length > 1 ? "Submit Form" : "Test Submit Form"}
                      </Button>

                      {Object.keys(previewData).length > 0 && (
                        <Button
                          variant="outlined"
                          size={isMobile ? "medium" : "large"}
                          fullWidth={isMobile}
                          onClick={() => setPreviewData({})}
                          sx={{
                            borderColor: "#457860",
                            color: "#457860",
                            "&:hover": {
                              borderColor: "#2d5a3d",
                              backgroundColor: "rgba(69, 120, 96, 0.04)",
                            },
                            px: isMobile ? 4 : 4,
                            py: isMobile ? 1.5 : 2,
                            borderRadius: 3,
                            fontWeight: "bold",
                            maxWidth: isMobile ? "none" : "200px",
                          }}
                        >
                          Clear Results
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Show test results below the test form */}
                {Object.keys(previewData).length > 0 && (
                  <Box
                    sx={{
                      mt: isMobile ? 2 : 3,
                      p: isMobile ? 2 : 3,
                      backgroundColor: "#e8f5e8",
                      border: "2px solid #4caf50",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      gutterBottom
                      sx={{
                        color: "#2e7d32",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        justifyContent: isMobile ? "center" : "flex-start",
                        textAlign: isMobile ? "center" : "left",
                      }}
                    >
                      ✅ Form Test Results
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#2e7d32",
                        mb: 2,
                        textAlign: isMobile ? "center" : "left",
                      }}
                    >
                      Your form submitted successfully! Here's the captured
                      data:
                    </Typography>

                    <Paper
                      elevation={1}
                      sx={{
                        p: isMobile ? 1.5 : 2,
                        backgroundColor: "white",
                        borderRadius: 1,
                        maxHeight: isMobile ? 200 : 300,
                        overflow: "auto",
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        fontFamily: "monospace",
                        border: "1px solid #c8e6c9",
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          color: "#2e7d32",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {JSON.stringify(previewData, null, isMobile ? 1 : 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </form>
            )}
          </Paper>

          {/* Side Panel - Like Form Builder */}
          <Paper
            elevation={2}
            sx={{
              width: isMobile ? "100%" : isTablet ? 280 : 320,
              p: isMobile ? 2 : 3,
              backgroundColor: "white",
              borderRadius: 2,
              maxHeight: isMobile ? "auto" : "calc(100vh - 140px)",
              overflow: isMobile ? "visible" : "auto",
              order: isMobile ? 1 : 2,
            }}
          >
            <Typography
              variant={isMobile ? "body1" : "h6"}
              gutterBottom
              sx={{
                color: "#457860",
                fontWeight: "bold",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              📊 Form Information
            </Typography>

            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: isMobile ? "center" : "left" }}
              >
                Form Name
              </Typography>
              <Typography
                variant="body1"
                fontWeight="medium"
                sx={{
                  textAlign: isMobile ? "center" : "left",
                  wordBreak: "break-word",
                }}
              >
                {formData?.formName || "Untitled Form"}
              </Typography>
            </Box>

            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: isMobile ? "center" : "left" }}
              >
                Total Fields
              </Typography>
              <Typography
                variant="body1"
                sx={{ textAlign: isMobile ? "center" : "left" }}
              >
                {fields.length} fields
              </Typography>
            </Box>

            {/* Step Information */}
            {steps.length > 1 && (
              <Box sx={{ mb: isMobile ? 2 : 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, textAlign: isMobile ? "center" : "left" }}
                >
                  Current Step
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: isMobile ? "center" : "left",
                    fontWeight: "medium",
                  }}
                >
                  {activeStep + 1} of {steps.length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: isMobile ? "center" : "left",
                    mt: 0.5,
                  }}
                >
                  {steps[activeStep]?.title || `Step ${activeStep + 1}`}
                </Typography>
              </Box>
            )}

            {hasFields && (
              <Box sx={{ mb: isMobile ? 2 : 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  onClick={() => navigate(`/app/form-builder/${formId}`)}
                  sx={{
                    borderColor: "#457860",
                    color: "#457860",
                    "&:hover": {
                      borderColor: "#2d5a3d",
                      backgroundColor: "rgba(69, 120, 96, 0.04)",
                    },
                    mb: 2,
                    py: isMobile ? 1 : 1.5,
                  }}
                >
                  📝 Edit Form
                </Button>

                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    color: "text.secondary",
                    fontStyle: "italic",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  }}
                >
                  {steps.length > 1
                    ? `Navigate through ${steps.length} steps to complete the form`
                    : `Use the test form ${
                        isMobile ? "below" : "at the bottom"
                      } to submit and see results`}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default FormPreview;
