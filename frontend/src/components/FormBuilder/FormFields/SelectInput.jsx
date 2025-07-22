import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

const SelectInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false
      }}
      render={({ field: controllerField }) => (
        <FormControl fullWidth error={!!errors[field.name]} disabled={disabled}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            {...controllerField}
            label={field.label}
            variant="outlined"
            size="medium"
          >
            {field.options?.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(errors[field.name]?.message || field.helperText) && (
            <FormHelperText>
              {errors[field.name]?.message || field.helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default SelectInput;