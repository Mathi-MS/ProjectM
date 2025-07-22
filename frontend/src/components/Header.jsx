import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExitToApp,
  Person,
  KeyboardArrowDown,
  Dashboard as DashboardIcon,
  MenuOpen,
  Close,
  LogoutOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const Header = ({
  onToggleSidebar,
  onToggleDesktopSidebar,
  sidebarCollapsed,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const firstName = Cookies.get("firstName");
  const lastName = Cookies.get("lastName");
  const role = Cookies.get("role");
  const email = Cookies.get("email");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    Cookies.remove("firstName");
    Cookies.remove("lastName");
    Cookies.remove("email");
    Cookies.remove("role");
    Cookies.remove("lastLogin");
    Cookies.remove("CableToken");
    Cookies.remove("id");
    navigate("/login");
    toast.success("Logged out successfully!");
    handleClose();
  };

  const handleProfile = () => {
    navigate("/app/profile");
    handleClose();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: "8px 12px", sm: "5px 16px" },
        background: "linear-gradient(135deg, #457860 0%, #2d5a3d 100%)",
        color: "white",
        borderRadius: 0,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        minHeight: { xs: "56px", sm: "64px" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: { xs: "40px", sm: "48px" },
        }}
      >
        {/* Left side - Toggle buttons and Welcome message */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1, md: 2 },
          }}
        >
          {/* Desktop Sidebar Toggle */}
          <IconButton
            color="inherit"
            onClick={onToggleDesktopSidebar}
            sx={{
              width: 40,
              height: 40,
              display: { xs: "none", md: "block" },
              p: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {sidebarCollapsed ? (
              <MenuIcon sx={{ fontSize: 24 }} />
            ) : (
              <MenuOpen sx={{ fontSize: 24 }} />
            )}
          </IconButton>

          {/* Mobile Sidebar Toggle */}
          <IconButton
            color="inherit"
            onClick={onToggleSidebar}
            sx={{
              width: 40,
              height: 40,
              display: { xs: "block", md: "none" },
              p: { xs: 0.5, sm: 1 },
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>

          <Box>
            <Typography
              variant="h6"
              component="h1"
              fontWeight="600"
              sx={{
                fontSize: { xs: "0.775rem", sm: "0.9rem", md: "1rem" },
                lineHeight: 1.2,
                "@media (max-width: 320px)": {
                  fontSize: "0.8rem",
                },
              }}
            >
              Welcome back, {firstName}!
            </Typography>
          </Box>
        </Box>

        {/* Right side - User info and dropdown */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1, md: 2 },
          }}
        >
          {/* User dropdown trigger */}
          <Box
            onClick={handleClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              p: { xs: 0.5, sm: 1 },
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {firstName?.[0]}
              {lastName?.[0]}
            </Avatar>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{ lineHeight: 1 }}
              >
                {firstName} {lastName}
              </Typography>
              <Chip
                label={role}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.75rem",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            </Box>

            <KeyboardArrowDown
              sx={{
                fontSize: { xs: 18, sm: 20 },
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </Box>

          {/* Unique Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 12,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.2))",
                mt: 1.5,
                minWidth: 280,
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 20,
                  width: 12,
                  height: 12,
                  background: "#ffffff",
                  transform: "translateY(-50%) rotate(45deg)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderBottomColor: "transparent",
                  borderRightColor: "transparent",
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* User Profile Header */}
            <Card
              elevation={0}
              sx={{
                m: 2,
                mb: 1,
                background: "linear-gradient(135deg, #457860 0%, #2d5a3d 100%)",
                color: "white",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                    }}
                  >
                    {firstName?.[0]}
                    {lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{ fontSize: "1rem" }}
                    >
                      {firstName} {lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.8rem" }}
                    >
                      {email}
                    </Typography>
                    <Chip
                      label={role}
                      size="small"
                      sx={{
                        mt: 0.5,
                        height: 20,
                        fontSize: "0.7rem",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Divider sx={{ mx: 2 }} />

            {/* Menu Items */}
            <MenuItem
              onClick={handleProfile}
              sx={{
                mx: 2,
                my: 1,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(69, 120, 96, 0.08)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon>
                <AccountCircleOutlined
                  fontSize="medium"
                  sx={{ color: "#457860" }}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight="500">
                  Profile Settings
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage your account
                </Typography>
              </ListItemText>
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              sx={{
                mx: 2,
                my: 1,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.08)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon>
                <LogoutOutlined fontSize="medium" sx={{ color: "#d32f2f" }} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight="500" color="#d32f2f">
                  Logout
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sign out of your account
                </Typography>
              </ListItemText>
            </MenuItem>

            {/* Footer */}
            <Box sx={{ px: 2, pb: 1, pt: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.7rem",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Cable Forms Dashboard v1.0
              </Typography>
            </Box>
          </Menu>
        </Box>
      </Box>
    </Paper>
  );
};

export default Header;
