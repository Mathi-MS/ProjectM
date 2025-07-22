import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import FormRenderer from "./FormRenderer";
import { generateFormSteps } from "./utils";
import { FIELD_TYPES } from "./constants";

const FormPreview = ({ fields }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    mode: "onChange",
  });

  const steps = generateFormSteps(fields);
  const currentStepFields = steps[activeStep]?.fields || [];

  console.log(
    "FormPreview render - Steps:",
    steps.length,
    "Active step:",
    activeStep
  );
  console.log("Current step fields:", currentStepFields.length);

  const handleNext = async (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("handleNext called, current step:", activeStep);
    console.log("Total steps:", steps.length);

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

    console.log("Fields to validate:", currentFieldNames);

    const isValid = await trigger(currentFieldNames);
    console.log("Validation result:", isValid);

    if (isValid) {
      const nextStep = activeStep + 1;
      console.log("Moving to step:", nextStep);
      setActiveStep(nextStep);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSubmittedData(null);
  };

  const onSubmit = (data) => {
    console.log("onSubmit called - Form submitted:", data);
    console.log("Current step when submitting:", activeStep);
    console.log("Is last step:", isLastStep);

    // Only submit if we're on the last step
    if (isLastStep) {
      setSubmittedData(data);
    } else {
      console.log("Preventing submission - not on last step");
      return false;
    }
  };

  const isLastStep = activeStep === steps.length - 1;

  console.log(
    "isLastStep calculation:",
    activeStep,
    "===",
    steps.length - 1,
    "=",
    isLastStep
  );

  if (fields.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No fields to preview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add some fields to see the form preview
        </Typography>
      </Paper>
    );
  }

  if (submittedData) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="success.main">
          Form Submitted Successfully!
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

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleReset}>
            Reset Form
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
        Form Preview
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Fields: {fields.length} | Steps: {steps.length} | Current:{" "}
        {currentStepFields.length}
      </Typography>

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

      <form onSubmit={handleSubmit(onSubmit)}>
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
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button
            type="button"
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
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
            {isLastStep ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size={isMobile ? "large" : "medium"}
                fullWidth={isMobile}
              >
                Submit Form
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                variant="contained"
                size={isMobile ? "large" : "medium"}
                fullWidth={isMobile}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the errors above before proceeding.
        </Alert>
      )}
    </Paper>
  );
};

export default FormPreview;
