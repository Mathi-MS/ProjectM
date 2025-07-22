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
} from "@mui/material";
import { useForm } from "react-hook-form";
import FormRenderer from "./FormRenderer";
import { generateFormSteps } from "./utils";
import { FIELD_TYPES } from "./constants";

const FormPreview = ({ fields }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);

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

  const handleNext = async () => {
    // Validate current step fields
    const currentFieldNames = currentStepFields
      .filter(
        (field) =>
          field.type !== FIELD_TYPES.HEADER &&
          field.type !== FIELD_TYPES.PARAGRAPH
      )
      .map((field) => field.name);

    const isValid = await trigger(currentFieldNames);

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
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
    console.log("Form submitted:", data);
    setSubmittedData(data);
  };

  const isLastStep = activeStep === steps.length - 1;

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
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Form Preview
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Fields count: {fields.length} | Steps: {steps.length} | Current step
        fields: {currentStepFields.length}
      </Typography>

      {steps.length > 1 && (
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
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

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 1 }}>
            {isLastStep ? (
              <Button type="submit" variant="contained" color="primary">
                Submit Form
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
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
