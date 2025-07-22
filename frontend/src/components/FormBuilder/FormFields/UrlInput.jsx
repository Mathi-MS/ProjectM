import React from "react";
import { TextField, Box } from "@mui/material";
import { Controller } from "react-hook-form";
import FieldLabel from "../FieldLabel";

const UrlInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        pattern: {
          value: /^https?:\/\/.+/,
          message:
            "Please enter a valid URL (starting with http:// or https://)",
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
            type="url"
            placeholder={field.placeholder || "https://example.com"}
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

export default UrlInput;
