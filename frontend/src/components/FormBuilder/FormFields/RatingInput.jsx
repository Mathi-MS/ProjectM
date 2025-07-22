import React from "react";
import { Box, Typography, FormHelperText } from "@mui/material";
import { Rating } from "@mui/material";
import { Controller } from "react-hook-form";

const RatingInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
      }}
      render={({ field: controllerField }) => (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {field.label}
          </Typography>
          <Rating
            {...controllerField}
            max={field.max || 5}
            disabled={disabled}
            size="large"
            precision={field.precision || 1}
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

export default RatingInput;
