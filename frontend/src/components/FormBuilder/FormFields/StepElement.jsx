import React from "react";
import { Box, Typography, Divider, Chip } from "@mui/material";
import { ViewModule as StepIcon } from "@mui/icons-material";

const StepElement = ({ field }) => {
  return (
    <Box
      sx={{
        p: 2,
        my: 2,
        border: "2px dashed",
        borderColor: "primary.main",
        borderRadius: 1,
        backgroundColor: "primary.light",
        textAlign: "center",
        opacity: 0.8,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <StepIcon color="primary" />
        <Chip
          label="Step Break"
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>

      <Typography variant="body2" color="primary.dark" fontWeight="medium">
        {field.title || "New Step"}
      </Typography>

      {field.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {field.description}
        </Typography>
      )}

      <Divider sx={{ mt: 1, borderColor: "primary.main" }} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Fields after this will appear on the next step/page
      </Typography>
    </Box>
  );
};

export default StepElement;
