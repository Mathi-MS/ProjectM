import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

const Settings = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1">
            This is the Settings page. Application and user settings will be
            implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
