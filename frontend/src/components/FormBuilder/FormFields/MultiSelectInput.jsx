import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Chip,
  Box,
  OutlinedInput
} from '@mui/material';
import { Controller } from 'react-hook-form';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const MultiSelectInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      defaultValue={[]}
      rules={{
        required: field.required ? `${field.label} is required` : false
      }}
      render={({ field: controllerField }) => (
        <FormControl fullWidth error={!!errors[field.name]} disabled={disabled}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            {...controllerField}
            multiple
            input={<OutlinedInput label={field.label} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const option = field.options?.find(opt => opt.value === value);
                  return (
                    <Chip 
                      key={value} 
                      label={option?.label || value} 
                      size="small" 
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={MenuProps}
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

export default MultiSelectInput;