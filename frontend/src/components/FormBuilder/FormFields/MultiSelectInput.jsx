import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  OutlinedInput,
} from "@mui/material";
import { Controller } from "react-hook-form";
import FieldLabel from "../FieldLabel";

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
              multiple
              displayEmpty
              input={<OutlinedInput />}
              renderValue={(selected) => {
                if (!selected || selected.length === 0) {
                  return (
                    <em style={{ color: "#999" }}>
                      {field.placeholder || "Select options"}
                    </em>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = field.options?.find(
                        (opt) => opt.value === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                          sx={{
                            transition: "none", // Prevent transition animations that might cause blinking
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              }}
              MenuProps={MenuProps}
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

export default MultiSelectInput;
