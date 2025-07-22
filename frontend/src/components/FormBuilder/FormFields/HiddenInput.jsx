import React from "react";
import { Controller } from "react-hook-form";
import { Box, Typography, Chip } from "@mui/material";
import { VisibilityOff as HiddenIcon } from "@mui/icons-material";

const HiddenInput = ({ field, control, errors }) => {
  return (
    <>
      {/* Hidden input for form submission */}
      <Controller
        name={field.name}
        control={control}
        defaultValue={field.value || ""}
        render={({ field: controllerField }) => (
          <input type="hidden" {...controllerField} />
        )}
      />

      {/* Visual indicator in form builder */}
      <Box
        sx={{
          p: 1,
          border: "1px dashed",
          borderColor: "grey.400",
          borderRadius: 1,
          backgroundColor: "grey.50",
          display: "flex",
          alignItems: "center",
          gap: 1,
          opacity: 0.7,
        }}
      >
        <HiddenIcon fontSize="small" color="disabled" />
        <Chip
          label="Hidden Field"
          size="small"
          variant="outlined"
          color="default"
        />
        <Typography variant="caption" color="text.secondary">
          {field.name}: {field.value || "(empty)"}
        </Typography>
      </Box>
    </>
  );
};

export default HiddenInput;
