import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Controller } from 'react-hook-form';

const PasswordInput = ({ field, control, errors, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        minLength: field.validations?.minLength ? {
          value: field.validations.minLength,
          message: `Minimum length is ${field.validations.minLength}`
        } : undefined,
        maxLength: field.validations?.maxLength ? {
          value: field.validations.maxLength,
          message: `Maximum length is ${field.validations.maxLength}`
        } : undefined,
        pattern: field.validations?.pattern ? {
          value: new RegExp(field.validations.pattern),
          message: field.validations.patternMessage || 'Invalid format'
        } : undefined
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          type={showPassword ? 'text' : 'password'}
          label={field.label}
          placeholder={field.placeholder}
          fullWidth
          disabled={disabled}
          error={!!errors[field.name]}
          helperText={errors[field.name]?.message || field.helperText}
          variant="outlined"
          size="medium"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={disabled}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      )}
    />
  );
};

export default PasswordInput;