import React, { useState } from 'react';
import { Box, TextField, Button, Popover } from '@mui/material';
import { Controller } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';

const ColorInput = ({ field, control, errors, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false
      }}
      render={({ field: controllerField }) => (
        <Box>
          <TextField
            {...controllerField}
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
            InputProps={{
              endAdornment: (
                <Button
                  onClick={handleClick}
                  disabled={disabled}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    backgroundColor: controllerField.value || '#000000',
                    border: '1px solid #ccc',
                    '&:hover': {
                      backgroundColor: controllerField.value || '#000000',
                    }
                  }}
                />
              )
            }}
          />
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2 }}>
              <HexColorPicker
                color={controllerField.value || '#000000'}
                onChange={controllerField.onChange}
              />
            </Box>
          </Popover>
        </Box>
      )}
    />
  );
};

export default ColorInput;