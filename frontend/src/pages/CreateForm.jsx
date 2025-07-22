import React from "react";
import { Box } from "@mui/material";
import { FormBuilder } from "../components/FormBuilder";

const CreateForm = () => {
  return (
    <Box sx={{ height: "100vh", overflow: "hidden" }}>
      <FormBuilder />
    </Box>
  );
};

export default CreateForm;
