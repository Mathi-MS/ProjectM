import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

const Forms = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Forms
          </Typography>
          <Typography variant="body1">
            This is the Forms page. Cable forms management will be implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Forms;