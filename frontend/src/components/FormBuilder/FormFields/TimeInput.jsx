import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const TimeInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          type="time"
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
        />
      )}
    />
  );
};

export default TimeInput;