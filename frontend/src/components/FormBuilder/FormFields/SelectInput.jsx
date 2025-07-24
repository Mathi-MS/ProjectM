import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from "@mui/material";
import { Controller } from "react-hook-form";
import FieldLabel from "../FieldLabel";

const SelectInput = ({ field, control, errors, disabled = false }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false,
      }}
      render={({ field: controllerField }) => (
        <Box>
          <FieldLabel
            label={field.label}
            required={field.required}
            helperText={field.helperText}
          />
          <FormControl
            fullWidth
            error={!!errors[field.name]}
            disabled={disabled}
          >
            <Select
              {...controllerField}
              variant="outlined"
              size="medium"
              displayEmpty
              renderValue={(selected) => {
                if (!selected || selected === "") {
                  return (
                    <em style={{ color: "#999" }}>
                      {field.placeholder || "Select an option"}
                    </em>
                  );
                }
                const option = field.options?.find(
                  (opt) => opt.value === selected
                );
                return option ? option.label : selected;
              }}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors[field.name]?.message && (
              <FormHelperText>{errors[field.name]?.message}</FormHelperText>
            )}
          </FormControl>
        </Box>
      )}
    />
  );
};

export default SelectInput;
