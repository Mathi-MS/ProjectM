import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useUsersAutocomplete } from "../hooks/useUsers";

const UserAutocomplete = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = "Search and select a user...",
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedUserCache, setSelectedUserCache] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: users = [], isLoading } =
    useUsersAutocomplete(debouncedSearchTerm);

  // Find the selected user object from the users list or use cached version
  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === value) || selectedUserCache;
  }, [users, value, selectedUserCache]);

  // Update cache when we find the selected user in the current users list
  useEffect(() => {
    if (value) {
      const foundUser = users.find((user) => user.id === value);
      if (foundUser) {
        setSelectedUserCache(foundUser);
      }
    } else {
      setSelectedUserCache(null);
    }
  }, [users, value]);

  const handleInputChange = useCallback((event, newInputValue) => {
    setSearchTerm(newInputValue);
  }, []);

  const handleChange = useCallback(
    (event, newValue) => {
      if (newValue) {
        // Cache the selected user immediately to prevent blinking
        setSelectedUserCache(newValue);
        onChange(newValue.id);
      } else {
        setSelectedUserCache(null);
        onChange(null);
      }
    },
    [onChange]
  );

  return (
    <Autocomplete
      value={selectedUser}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={users}
      getOptionLabel={(option) => option?.label || option?.name || ""}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      loading={isLoading}
      disabled={disabled}
      noOptionsText={searchTerm ? "No users found" : "Type to search users"}
      blurOnSelect={true}
      clearOnBlur={false}
      selectOnFocus={false}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#457860" }}>
            <PersonIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email}
            </Typography>
          </Box>
        </Box>
      )}
      {...props}
    />
  );
};

export default UserAutocomplete;
