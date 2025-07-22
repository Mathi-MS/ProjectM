import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const NumberInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
        min: field.validations?.min ? {
          value: field.validations.min,
          message: `Minimum value is ${field.validations.min}`
        } : undefined,
        max: field.validations?.max ? {
          value: field.validations.max,
          message: `Maximum value is ${field.validations.max}`
        } : undefined,
        pattern: field.validations?.pattern ? {
          value: new RegExp(field.validations.pattern),
          message: field.validations.patternMessage || 'Invalid format'
        } : undefined
      }}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          type="number"
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
          inputProps={{
            min: field.validations?.min,
            max: field.validations?.max,
            step: field.step || 'any'
          }}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            controllerField.onChange(value);
          }}
        />
      )}
    />
  );
};

export default NumberInput;