import React from "react";
import { FormControlLabel, Checkbox, FormHelperText, Box } from "@mui/material";
import { Controller } from "react-hook-form";
import FieldLabel from "../FieldLabel";

const CheckboxInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
      }}
      render={({ field: controllerField }) => (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  {...controllerField}
                  checked={controllerField.value || false}
                  disabled={disabled}
                  color="primary"
                />
              }
              label={field.label}
              sx={{ margin: 0 }}
            />
            {field.helperText && (
              <FieldLabel
                label=""
                helperText={field.helperText}
                sx={{ mb: 0 }}
              />
            )}
          </Box>
          {errors[field.name]?.message && (
            <FormHelperText error={!!errors[field.name]}>
              {errors[field.name]?.message}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

export default CheckboxInput;
