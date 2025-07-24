import React from "react";
import { Chip, Avatar, Tooltip } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

const UserChip = ({ user, size = "small" }) => {
  if (!user) {
    return (
      <Chip
        label="N/A"
        size={size}
        variant="outlined"
        sx={{
          color: "#666",
          borderColor: "#ddd",
        }}
      />
    );
  }

  return (
    <Tooltip title={`${user.name} (${user.email})`} arrow>
      <Chip
        avatar={
          <Avatar sx={{ width: 24, height: 24, bgcolor: "#457860" }}>
            <PersonIcon sx={{ fontSize: 14 }} />
          </Avatar>
        }
        label={user.name}
        size={size}
        sx={{
          maxWidth: 150,
          "& .MuiChip-label": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }}
      />
    </Tooltip>
  );
};

export default UserChip;
