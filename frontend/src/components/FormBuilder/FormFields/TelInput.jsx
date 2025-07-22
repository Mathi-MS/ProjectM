import React from "react";
import { TextField, Box } from "@mui/material";
import { Controller } from "react-hook-form";
import FieldLabel from "../FieldLabel";

const TelInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        pattern: field.validations?.pattern
          ? {
              value: new RegExp(field.validations.pattern),
              message:
                field.validations.patternMessage ||
                "Invalid phone number format",
            }
          : undefined,
      }}
      render={({ field: controllerField }) => (
        <Box>
          <FieldLabel
            label={field.label}
            required={field.required}
            helperText={field.helperText}
          />
          <TextField
            {...controllerField}
            type="tel"
            placeholder={field.placeholder || "+1 (555) 123-4567"}
            fullWidth
            disabled={disabled}
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message}
            variant="outlined"
            size="medium"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      )}
    />
  );
};

export default TelInput;
