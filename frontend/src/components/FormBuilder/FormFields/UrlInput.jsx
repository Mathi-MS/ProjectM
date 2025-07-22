import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const UrlInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        pattern: {
          value: /^https?:\/\/.+/,
          message: 'Please enter a valid URL (starting with http:// or https://)'
        }
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          type="url"
          label={field.label}
          placeholder={field.placeholder || 'https://example.com'}
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

export default UrlInput;