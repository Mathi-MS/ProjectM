import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

const Profile = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="body1">
            This is the Profile page. User profile management features will be
            implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
