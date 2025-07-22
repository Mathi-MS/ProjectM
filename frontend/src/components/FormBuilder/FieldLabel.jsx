import React from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { HelpOutline as HelpIcon } from "@mui/icons-material";

const FieldLabel = ({ 
  label, 
  required = false, 
  helperText = "", 
  sx = {},
  ...props 
}) => {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0.5,
        mb: 0.5,
        ...sx 
      }} 
      {...props}
    >
      <Typography
        variant="body2"
        component="label"
        sx={{
          fontWeight: 500,
          color: "text.primary",
        }}
      >
        {label}
        {required && (
          <Typography
            component="span"
            sx={{
              color: "error.main",
              ml: 0.5,
            }}
          >
            *
          </Typography>
        )}
      </Typography>
      
      {helperText && (
        <Tooltip
          title={helperText}
          placement="top"
          arrow
          sx={{
            "& .MuiTooltip-tooltip": {
              maxWidth: 300,
              fontSize: "0.875rem",
              lineHeight: 1.4,
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              padding: 0.25,
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "transparent",
              },
            }}
          >
            <HelpIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default FieldLabel;