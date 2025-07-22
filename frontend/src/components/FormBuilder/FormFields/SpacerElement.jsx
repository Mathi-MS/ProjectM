import React from "react";
import { Box } from "@mui/material";

const SpacerElement = ({ field }) => {
  return (
    <Box
      sx={{
        height: field.height || 20,
        width: "100%",
      }}
    />
  );
};

export default SpacerElement;
