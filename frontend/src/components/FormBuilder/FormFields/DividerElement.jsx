import React from "react";
import { Divider } from "@mui/material";

const DividerElement = ({ field }) => {
  return (
    <Divider
      sx={{
        my: field.margin || 2,
        borderColor: field.color || "divider",
        borderWidth: field.thickness || 1,
      }}
    />
  );
};

export default DividerElement;
