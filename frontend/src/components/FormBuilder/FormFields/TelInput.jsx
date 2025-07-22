import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const TelInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        pattern: field.validations?.pattern ? {
          value: new RegExp(field.validations.pattern),
          message: field.validations.patternMessage || 'Invalid phone number format'
        } : undefined
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          type="tel"
          label={field.label}
          placeholder={field.placeholder || '+1 (555) 123-4567'}
          fullWidth
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

export default TelInput;