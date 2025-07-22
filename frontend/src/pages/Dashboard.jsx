import React from "react";
import {
  Box,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  Typography,
} from "@mui/material";
import {
  Person,
  Email,
  AdminPanelSettings,
  AccessTime,
} from "@mui/icons-material";
import Cookies from "js-cookie";

const Dashboard = () => {
  const firstName = Cookies.get("firstName");
  const lastName = Cookies.get("lastName");
  const email = Cookies.get("email");
  const role = Cookies.get("role");
  const lastLogin = Cookies.get("lastLogin");

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        "@media (max-width: 320px)": {
          mx: 0,
        },
      }}
    >
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent
              sx={{
                textAlign: "center",
                p: { xs: 2, sm: 3 },
                "@media (max-width: 320px)": {
                  p: 1.5,
                },
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  mx: "auto",
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #457860 0%, #2d5a3d 100%)",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  "@media (max-width: 320px)": {
                    width: 50,
                    height: 50,
                    fontSize: "1.25rem",
                  },
                }}
              >
                {firstName?.[0]}
                {lastName?.[0]}
              </Avatar>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  "@media (max-width: 320px)": {
                    fontSize: "0.9rem",
                  },
                }}
              >
                {firstName} {lastName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  wordBreak: "break-word",
                  "@media (max-width: 320px)": {
                    fontSize: "0.75rem",
                  },
                }}
              >
                {email}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: role === "Admin" ? "#d32f2f" : "#457860",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {role === "Admin" ? (
                  <AdminPanelSettings fontSize="small" />
                ) : (
                  <Person fontSize="small" />
                )}
                {role}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Details Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent
              sx={{
                p: { xs: 2, sm: 3 },
                "@media (max-width: 320px)": {
                  p: 1.5,
                },
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {firstName} {lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Email color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email Address
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {lastLogin}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {/* {formatDate(user?.createdAt)} */}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
