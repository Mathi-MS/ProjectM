import React from "react";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

const TextareaInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        minLength: field.validations?.minLength
          ? {
              value: field.validations.minLength,
              message: `Minimum length is ${field.validations.minLength}`,
            }
          : undefined,
        maxLength: field.validations?.maxLength
          ? {
              value: field.validations.maxLength,
              message: `Maximum length is ${field.validations.maxLength}`,
            }
          : undefined,
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          label={field.label}
          placeholder={field.placeholder}
          fullWidth
          multiline
          rows={field.rows || 4}
          disabled={disabled}
          error={!!errors[field.name]}
          helperText={errors[field.name]?.message || field.helperText}
          variant="outlined"
          size="medium"
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
    />
  );
};

export default TextareaInput;
