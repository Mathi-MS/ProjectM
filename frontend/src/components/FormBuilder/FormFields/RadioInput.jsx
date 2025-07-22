import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormHelperText 
} from '@mui/material';
import { Controller } from 'react-hook-form';

const RadioInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false
      }}
      render={({ field: controllerField }) => (
        <FormControl error={!!errors[field.name]} disabled={disabled}>
          <FormLabel component="legend">{field.label}</FormLabel>
          <RadioGroup
            {...controllerField}
            row={field.layout === 'horizontal'}
          >
            {field.options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
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

export default RadioInput;