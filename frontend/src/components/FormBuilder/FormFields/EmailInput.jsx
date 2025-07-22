import React from "react";
import { TextField, Box } from "@mui/material";
import { Controller } from "react-hook-form";
import FieldLabel from "../FieldLabel";

const EmailInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
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
            type="email"
            placeholder={field.placeholder}
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

export default EmailInput;
