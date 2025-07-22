import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const DateInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        min: field.validations?.min ? {
          value: field.validations.min,
          message: `Date must be after ${field.validations.min}`
        } : undefined,
        max: field.validations?.max ? {
          value: field.validations.max,
          message: `Date must be before ${field.validations.max}`
        } : undefined
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          type="date"
          label={field.label}
          fullWidth
          disabled={disabled}
          error={!!errors[field.name]}
          helperText={errors[field.name]?.message || field.helperText}
          variant="outlined"
          size="medium"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: field.validations?.min,
            max: field.validations?.max
          }}
        />
      )}
    />
  );
};

export default DateInput;