import React from "react";
import { FormControlLabel, Switch, FormHelperText, Box } from "@mui/material";
import { Controller } from "react-hook-form";

const SwitchInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
      }}
      render={({ field: controllerField }) => (
        <Box>
          <FormControlLabel
            control={
              <Switch
                {...controllerField}
                checked={controllerField.value || false}
                disabled={disabled}
                color="primary"
              />
            }
            label={field.label}
          />
          {(errors[field.name]?.message || field.helperText) && (
            <FormHelperText error={!!errors[field.name]}>
              {errors[field.name]?.message || field.helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

export default SwitchInput;
