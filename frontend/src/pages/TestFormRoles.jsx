import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useUsers } from "../hooks/useAuth";
import UserChip from "../components/UserChip";

const TestFormRoles = () => {
  const [initiator, setInitiator] = useState(null);
  const [reviewer, setReviewer] = useState(null);
  const [approver, setApprover] = useState(null);

  const {
    data: usersData,
    isLoading,
    error,
  } = useUsers({
    page: 1,
    limit: 100,
    search: "",
    sortBy: "firstName",
    sortOrder: "asc",
  });

  const users = usersData?.users || [];

  const handleSubmit = () => {
    console.log("Form Roles:", {
      initiator,
      reviewer,
      approver,
    });
    alert("Check console for role data");
  };

  const handleClear = () => {
    setInitiator(null);
    setReviewer(null);
    setApprover(null);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Test Form Roles Integration
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Error loading users: {error.message}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
            {/* Initiator Select */}
            <FormControl size="small" fullWidth>
              <InputLabel>Initiator</InputLabel>
              <Select
                value={initiator || ""}
                onChange={(e) => setInitiator(e.target.value || null)}
                label="Initiator"
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography
                        color="textSecondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        Select an initiator...
                      </Typography>
                    );
                  }
                  const user = users.find((u) => u._id === selected);
                  if (!user) return selected;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                      >
                        <PersonIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="body2">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {isLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading users...</Typography>
                    </Box>
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Reviewer Select */}
            <FormControl size="small" fullWidth>
              <InputLabel>Reviewer</InputLabel>
              <Select
                value={reviewer || ""}
                onChange={(e) => setReviewer(e.target.value || null)}
                label="Reviewer"
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography
                        color="textSecondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        Select a reviewer...
                      </Typography>
                    );
                  }
                  const user = users.find((u) => u._id === selected);
                  if (!user) return selected;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                      >
                        <PersonIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="body2">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {isLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading users...</Typography>
                    </Box>
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Approver Select */}
            <FormControl size="small" fullWidth>
              <InputLabel>Approver</InputLabel>
              <Select
                value={approver || ""}
                onChange={(e) => setApprover(e.target.value || null)}
                label="Approver"
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography
                        color="textSecondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        Select an approver...
                      </Typography>
                    );
                  }
                  const user = users.find((u) => u._id === selected);
                  if (!user) return selected;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24, bgcolor: "#457860" }}
                      >
                        <PersonIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="body2">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {isLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading users...</Typography>
                    </Box>
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "#457860" }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Roles Preview:
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Initiator:
                </Typography>
                <UserChip user={users.find((u) => u.id === initiator)} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Reviewer:
                </Typography>
                <UserChip user={users.find((u) => u.id === reviewer)} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Approver:
                </Typography>
                <UserChip user={users.find((u) => u.id === approver)} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: "#457860",
                "&:hover": {
                  backgroundColor: "#2d5a3d",
                },
              }}
            >
              Test Submit
            </Button>
            <Button variant="outlined" onClick={handleClear}>
              Clear All
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Users ({users.length}):
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {users.map((user) => (
                <UserChip key={user.id} user={user} />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestFormRoles;
