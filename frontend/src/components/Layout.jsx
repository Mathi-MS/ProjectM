import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop sidebar collapse

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleToggleDesktopSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        collapsed={sidebarCollapsed}
      />

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginLeft: {
            xs: 0,
            md: sidebarCollapsed ? 0 : "280px",
          },
          transition: "margin-left 0.3s ease",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Fixed Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100,
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Header
            onToggleSidebar={handleToggleSidebar}
            onToggleDesktopSidebar={handleToggleDesktopSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
        </Box>

        {/* Scrollable Page content via Outlet */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: "8px", sm: 2, md: 3 },
            background: "#f5f5f5",
            overflow: "auto",
            height: "calc(100vh - 64px)", // Subtract header height
            "@media (max-width: 600px)": {
              height: "calc(100vh - 56px)", // Mobile header height
            },
            "@media (max-width: 320px)": {
              p: "6px",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
