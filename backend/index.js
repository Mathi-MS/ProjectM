const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const User = require("./models/User");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 5 requests per windowMs
  message: {
    message: "Too many authentication attempts, please try again later.",
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Utility function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Cable Forms Backend API",
    version: "1.0.0",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Registration endpoint
app.post(
  "/api/auth/register",
  authLimiter,
  [
    body("firstName")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("First name must be between 3 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("First name can only contain letters and spaces"),
    body("lastName")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Last name can only contain letters and spaces"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
    body("role")
      .optional()
      .isIn(["User", "Admin"])
      .withMessage("Role must be either User or Admin"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      // Create new user (password hashing is handled by the model)
      // For testing purposes, allow role to be passed in the request
      const { role = "User" } = req.body;
      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        role: role,
      });

      await newUser.save();

      // Generate token
      const token = generateToken(newUser);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Handle mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      res.status(500).json({
        message: "Internal server error during registration",
      });
    }
  }
);

// Login endpoint
app.post(
  "/api/auth/login",
  authLimiter,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          message: "Account is deactivated",
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Internal server error during login",
      });
    }
  }
);

// Get current user profile
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      message: "Internal server error while fetching profile",
    });
  }
});

// Update user profile
app.put(
  "/api/auth/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("First name must be between 3 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { firstName, lastName } = req.body;

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);

      // Handle mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        message: "Internal server error during profile update",
      });
    }
  }
);

// Logout endpoint (optional - mainly for clearing client-side token)
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Protected route example
app.get("/api/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to Cable Forms Dashboard",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// ============= USER MANAGEMENT CRUD ENDPOINTS =============

// Get all users (Admin only)
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    // For testing purposes, allow all authenticated users to view users list
    // In production, uncomment the admin check below
    // if (req.user.role !== "Admin") {
    //   return res.status(403).json({
    //     message: "Access denied. Admin privileges required.",
    //   });
    // }

    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "firstName",
      sortOrder = "asc",
    } = req.query;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Get users with pagination and sorting
    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      message: "Users retrieved successfully",
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Internal server error while fetching users",
    });
  }
});

// Get user by ID (Admin only)
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    // For testing purposes, allow all authenticated users
    // if (req.user.role !== "Admin") {
    //   return res.status(403).json({
    //     message: "Access denied. Admin privileges required.",
    //   });
    // }

    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      message: "Internal server error while fetching user",
    });
  }
});

// Update user (Admin only)
app.put(
  "/api/users/:id",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("First name must be between 3 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("First name can only contain letters and spaces"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Last name can only contain letters and spaces"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("role")
      .optional()
      .isIn(["User", "Admin"])
      .withMessage("Role must be either User or Admin"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "Admin") {
        return res.status(403).json({
          message: "Access denied. Admin privileges required.",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { firstName, lastName, email, role, isActive } = req.body;

      // Validate ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "Invalid user ID format",
        });
      }

      // Find user
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Prevent admin from deactivating themselves
      if (req.user.id === id && isActive === false) {
        return res.status(400).json({
          message: "You cannot deactivate your own account",
        });
      }

      // Prevent admin from changing their own role
      if (req.user.id === id && role && role !== user.role) {
        return res.status(400).json({
          message: "You cannot change your own role",
        });
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== id) {
          return res.status(400).json({
            message: "Email is already taken by another user",
          });
        }
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      if (role) user.role = role;
      if (typeof isActive === "boolean") user.isActive = isActive;

      await user.save();

      res.json({
        message: "User updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);

      // Handle mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Email is already taken by another user",
        });
      }

      res.status(500).json({
        message: "Internal server error during user update",
      });
    }
  }
);

// Delete user (Admin only)
app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Internal server error during user deletion",
    });
  }
});

// Create user (Admin only)
app.post(
  "/api/users",
  authenticateToken,
  [
    body("firstName")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("First name must be between 3 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("First name can only contain letters and spaces"),
    body("lastName")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Last name can only contain letters and spaces"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    body("role")
      .optional()
      .isIn(["User", "Admin"])
      .withMessage("Role must be either User or Admin"),
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "Admin") {
        return res.status(403).json({
          message: "Access denied. Admin privileges required.",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password, role = "User" } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        isActive: true,
      });

      await newUser.save();

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error("Create user error:", error);

      // Handle mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      res.status(500).json({
        message: "Internal server error during user creation",
      });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Cable Forms Backend server is running on port ${PORT}`);
  console.log(`📍 Backend URL: http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Database: "cable-forms" (MongoDB)`);
  console.log(
    `👤 Sample users: admin@cableforms.com, john@cableforms.com (password: "password")`
  );
  console.log(
    `📝 Run 'npm run seed' to create sample users if they don't exist`
  );
});
