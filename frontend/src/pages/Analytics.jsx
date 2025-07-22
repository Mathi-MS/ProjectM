import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

const Analytics = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body1">
            This is the Analytics page. Data analytics and reporting features
            will be implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
