import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  LoginRounded,
  PersonAddRounded,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSchema, registerSchema } from "../schemas/validationSchemas";
import { useLogin, useRegister } from "../hooks/useAuth";
import Cookies from "js-cookie";

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // TanStack Query hooks
  const { mutate: loginMutation } = useLogin();
  const { mutate: registerMutation } = useRegister();

  const loading = loginMutation.isPending || registerMutation.isPending;

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    reset();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const onSubmit = async (data) => {
    if (isLogin) {
      loginMutation(
        { email: data.email, password: data.password },
        {
          onSuccess: (data) => {
            reset();
            const user = data.user;
            Cookies.set("email", user.email, { path: "/" });
            Cookies.set("id", user.id, { path: "/" });
            Cookies.set("firstName", user.firstName, { path: "/" });
            Cookies.set("lastName", user.lastName, { path: "/" });
            Cookies.set("role", user.role, { path: "/" });
            Cookies.set("CableToken", data.token, { path: "/" });
            toast.success(data.message || "Login successful!");
            // Small delay to ensure cookies are set before navigation
            setTimeout(() => {
              navigate("/app");
            }, 100);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      registerMutation(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        {
          onSuccess: (data) => {
            reset();
            setIsLogin(true);
            toast.success(data.message || "Login successful!");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(175deg, rgba(15, 62, 77, 1) 0%, rgba(2, 102, 58, 1) 100%)",
        padding: 1,
        overflow: "auto",
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: "100%",
          maxWidth: 420,
          padding: isMobile ? 2.5 : 3,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #457860 0%, #2d5a3d 100%)",
              mb: 1.5,
              boxShadow: "0 8px 32px rgba(69, 120, 96, 0.3)",
            }}
          >
            {isLogin ? (
              <LoginRounded sx={{ fontSize: 28, color: "white" }} />
            ) : (
              <PersonAddRounded sx={{ fontSize: 28, color: "white" }} />
            )}
          </Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#2c3e50",
              mb: 0.5,
              fontSize: isMobile ? "1.4rem" : "1.65rem",
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontSize: "0.9rem" }}
          >
            {isLogin
              ? "Sign in to your account to continue"
              : "Join us and start your journey today"}
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: "#d32f2f",
              },
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {!isLogin && (
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <TextField
                  {...formRegister("firstName")}
                  label="First Name"
                  fullWidth
                  size="small"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "#457860", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#457860",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#457860",
                    },
                  }}
                />
                <TextField
                  {...formRegister("lastName")}
                  label="Last Name"
                  fullWidth
                  size="small"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "#457860", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#457860",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#457860",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#457860",
                    },
                  }}
                />
              </Box>
            )}

            <TextField
              {...formRegister("email")}
              label="Email Address"
              type="text"
              fullWidth
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#457860", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#457860",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#457860",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#457860",
                },
              }}
            />

            <TextField
              {...formRegister("password")}
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#457860", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#457860",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#457860",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#457860",
                },
              }}
            />

            {!isLogin && (
              <TextField
                {...formRegister("confirmPassword")}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                size="small"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#457860", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        disabled={loading}
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#457860",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#457860",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#457860",
                  },
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1.5,
                py: 1,
                borderRadius: 2,
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #457860 0%, #2d5a3d 100%)",
                boxShadow: "0 8px 32px rgba(69, 120, 96, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #3a6650 0%, #1f4129 100%)",
                  boxShadow: "0 12px 40px rgba(69, 120, 96, 0.4)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "white" }} />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}{" "}
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 2.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.85rem" }}
          >
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.8rem" }}
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={toggleMode}
            disabled={loading}
            sx={{
              ml: 1,
              color: "#457860",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.8rem",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
