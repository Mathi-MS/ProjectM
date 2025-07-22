import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  People,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const drawerWidth = 280;
const mobileDrawerWidth = 260;

const Sidebar = ({ open = false, onClose, collapsed = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const role = Cookies.get("role");

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/app/dashboard" },
    { text: "Create Form", icon: <Assignment />, path: "/app/create-form" },
    ...(role === "Admin"
      ? [{ text: "User Management", icon: <People />, path: "/app/users" }]
      : []),
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Project Header Section */}
      <Box
        sx={{
          p: { xs: 1.5, md: 2.5 },
          textAlign: "center",
          background: "linear-gradient(135deg, #457860 0%, #2d5a3d 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <DescriptionIcon
            sx={{
              fontSize: { xs: "1.75rem", md: "2rem" },
              color: "white",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1rem", md: "1.25rem" },
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Unknown
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            fontSize: { xs: "0.7rem", md: "0.8rem" },
            fontStyle: "italic",
          }}
        >
          Management System
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, py: 1.5 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  minHeight: 44,
                  "& .MuiListItemText-primary": {
                    fontSize: "0.875rem",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(69, 120, 96, 0.15)",
                    borderLeft: "4px solid #457860",
                    "& .MuiListItemIcon-root": {
                      color: "#457860",
                    },
                    "& .MuiListItemText-primary": {
                      color: "#457860",
                      fontWeight: 600,
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(69, 120, 96, 0.08)",
                  },
                  [theme.breakpoints.down("md")]: {
                    minHeight: 48,
                    "& .MuiListItemIcon-root": {
                      minWidth: 44,
                    },
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path ? "#457860" : "inherit",
                    minWidth: 44,
                    "& .MuiSvgIcon-root": {
                      fontSize: "1.25rem",
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: "0.875rem",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!collapsed && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #e0e0e0",
              position: "fixed",
              height: "100%",
              zIndex: 1200,
              transform: collapsed
                ? `translateX(-${drawerWidth}px)`
                : "translateX(0)",
              transition: "transform 0.3s ease",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: mobileDrawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
