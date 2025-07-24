const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const User = require("./models/User");
const Form = require("./models/Form");
const {
  validateFormFields,
  validateFields,
} = require("./utils/fieldValidation");
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
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
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

// Get users for autocomplete (simplified endpoint) - MUST come before /:id route
app.get("/api/users/autocomplete", authenticateToken, async (req, res) => {
  try {
    const { search = "" } = req.query;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
          isActive: true,
        }
      : { isActive: true };

    // Get users with limited fields for autocomplete
    const users = await User.find(searchQuery)
      .select("_id firstName lastName email")
      .limit(20) // Limit results for performance
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      message: "Users retrieved successfully",
      users: users.map((user) => ({
        id: user._id,
        value: user._id,
        label: `${user.firstName} ${user.lastName}`,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      })),
    });
  } catch (error) {
    console.error("Get users autocomplete error:", error);
    res.status(500).json({
      message: "Internal server error while fetching users for autocomplete",
    });
  }
});

// Get user by email - MUST come before /:id route
app.get("/api/users/email/:email", authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const user = await User.findByEmail(email).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user by email error:", error);
    res.status(500).json({
      message: "Internal server error while fetching user",
    });
  }
});

// Update user by email - MUST come before /:id route
app.put(
  "/api/users/email/:email",
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

      const { email } = req.params;
      const { firstName, lastName, email: newEmail, role, isActive } = req.body;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Prevent admin from deactivating themselves
      if (req.user.id === user._id.toString() && isActive === false) {
        return res.status(400).json({
          message: "You cannot deactivate your own account",
        });
      }

      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (newEmail !== undefined) user.email = newEmail;
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();

      res.json({
        success: true,
        message: "User updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Update user by email error:", error);
      res.status(500).json({
        message: "Internal server error during user update",
      });
    }
  }
);

// Delete user by email - MUST come before /:id route
app.delete("/api/users/email/:email", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    const { email } = req.params;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Delete user by email error:", error);
    res.status(500).json({
      message: "Internal server error during user deletion",
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

// Delete user by email (Admin only)
app.delete("/api/users/email/:email", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    const { email } = req.params;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Delete user by email error:", error);
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

// ============= FORM MANAGEMENT ENDPOINTS =============

// Create new form endpoint (just name)
app.post(
  "/api/forms/create",
  authenticateToken,
  [
    body("formName")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Form name must be between 3 and 100 characters"),
  ],
  async (req, res) => {
    console.log("=== Form Create Request ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);
    console.log("Timestamp:", new Date().toISOString());

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { formName, initiator, reviewer, approver } = req.body;
      console.log("Extracted data:", {
        formName,
        initiator,
        reviewer,
        approver,
      });

      // Check if form name already exists for this user
      console.log("Checking for existing form...");
      const existingForm = await Form.findOne({
        formName: formName,
        createdBy: req.user.id,
        isActive: true,
      });
      console.log("Existing form found:", existingForm ? "Yes" : "No");

      if (existingForm) {
        console.log("Form already exists, returning error");
        return res.status(400).json({
          message: "A form with this name already exists",
        });
      }

      // Create new form with minimal data
      console.log("Creating new form...");
      const newForm = new Form({
        formName,
        fields: [],
        metadata: {
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          version: "1.0",
        },
        createdBy: req.user.id,
        initiator: initiator || null,
        reviewer: reviewer || null,
        approver: approver || null,
        status: "inactive",
      });
      console.log("Form object created, saving...");

      await newForm.save();
      console.log("Form saved successfully, ID:", newForm._id);

      // Populate user references
      await newForm.populate([
        { path: "createdBy", select: "firstName lastName email" },
        { path: "initiator", select: "firstName lastName email" },
        { path: "reviewer", select: "firstName lastName email" },
        { path: "approver", select: "firstName lastName email" },
      ]);

      res.status(201).json({
        message: "Form created successfully",
        form: {
          id: newForm._id,
          formName: newForm.formName,
          status: newForm.status,
          createdBy: newForm.createdBy
            ? {
                id: newForm.createdBy._id,
                name: `${newForm.createdBy.firstName} ${newForm.createdBy.lastName}`,
                email: newForm.createdBy.email,
              }
            : null,
          initiator: newForm.initiator
            ? {
                id: newForm.initiator._id,
                name: `${newForm.initiator.firstName} ${newForm.initiator.lastName}`,
                email: newForm.initiator.email,
              }
            : null,
          reviewer: newForm.reviewer
            ? {
                id: newForm.reviewer._id,
                name: `${newForm.reviewer.firstName} ${newForm.reviewer.lastName}`,
                email: newForm.reviewer.email,
              }
            : null,
          approver: newForm.approver
            ? {
                id: newForm.approver._id,
                name: `${newForm.approver.firstName} ${newForm.approver.lastName}`,
                email: newForm.approver.email,
              }
            : null,
          createdAt: newForm.createdAt,
          updatedAt: newForm.updatedAt,
          fieldsCount: newForm.fields.length,
        },
      });
    } catch (error) {
      console.error("Form create error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Request body:", req.body);
      console.error("User ID:", req.user?.id);

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

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          message: "A form with this name already exists",
          error: "Duplicate form name",
        });
      }

      res.status(500).json({
        message: "Internal server error while creating form",
        error: error.message,
      });
    }
  }
);

// Save form endpoint
app.post(
  "/api/forms/save",
  [
    body("formName")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Form name must be between 3 and 100 characters"),
    ...validateFormFields(),
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

      const { formName, fields, metadata, initiator, reviewer, approver } =
        req.body;

      // Get field validation warnings (errors are already handled by express-validator)
      const fieldValidation = validateFields(fields);
      const warnings = fieldValidation.warnings || [];

      // Create new form
      const newForm = new Form({
        formName,
        fields,
        metadata: {
          ...metadata,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
        initiator: initiator || null,
        reviewer: reviewer || null,
        approver: approver || null,
        // If authentication is implemented, add createdBy: req.user.id
      });

      await newForm.save();

      res.status(201).json({
        message: "Form saved successfully",
        form: {
          id: newForm._id,
          formName: newForm.formName,
          fieldsCount: newForm.fields.length,
          createdAt: newForm.createdAt,
          metadata: newForm.metadata,
        },
        warnings: warnings,
      });
    } catch (error) {
      console.error("Form save error:", error);

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
        message: "Internal server error while saving form",
      });
    }
  }
);

// Get all forms endpoint
app.get("/api/forms", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build search query
    const searchQuery = search
      ? {
          formName: { $regex: search, $options: "i" },
          isActive: true,
        }
      : { isActive: true };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Get forms with pagination and sorting
    const forms = await Form.find(searchQuery)
      .populate([
        { path: "createdBy", select: "firstName lastName email" },
        { path: "initiator", select: "firstName lastName email" },
        { path: "reviewer", select: "firstName lastName email" },
        { path: "approver", select: "firstName lastName email" },
      ])
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "formName fields metadata createdAt updatedAt status createdBy initiator reviewer approver"
      );

    // Get total count for pagination
    const totalForms = await Form.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalForms / parseInt(limit));

    res.json({
      message: "Forms retrieved successfully",
      forms: forms.map((form) => ({
        id: form._id,
        formName: form.formName,
        status: form.status,
        createdBy: form.createdBy
          ? {
              id: form.createdBy._id,
              name: `${form.createdBy.firstName} ${form.createdBy.lastName}`,
              email: form.createdBy.email,
            }
          : null,
        initiator: form.initiator
          ? {
              id: form.initiator._id,
              name: `${form.initiator.firstName} ${form.initiator.lastName}`,
              email: form.initiator.email,
            }
          : null,
        reviewer: form.reviewer
          ? {
              id: form.reviewer._id,
              name: `${form.reviewer.firstName} ${form.reviewer.lastName}`,
              email: form.reviewer.email,
            }
          : null,
        approver: form.approver
          ? {
              id: form.approver._id,
              name: `${form.approver.firstName} ${form.approver.lastName}`,
              email: form.approver.email,
            }
          : null,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        fieldsCount: form.fields.length,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalForms,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get forms error:", error);
    res.status(500).json({
      message: "Internal server error while fetching forms",
    });
  }
});

// Get form by ID endpoint
app.get("/api/forms/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(id).populate([
      { path: "createdBy", select: "firstName lastName email" },
      { path: "initiator", select: "firstName lastName email" },
      { path: "reviewer", select: "firstName lastName email" },
      { path: "approver", select: "firstName lastName email" },
    ]);

    if (!form || !form.isActive) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    // Check if the form belongs to the authenticated user
    if (form.createdBy && form.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied. You can only access your own forms.",
      });
    }

    res.json({
      message: "Form retrieved successfully",
      _id: form._id,
      id: form._id,
      formName: form.formName,
      fields: form.fields,
      status: form.status,
      metadata: form.metadata,
      createdBy: form.createdBy
        ? {
            id: form.createdBy._id,
            name: `${form.createdBy.firstName} ${form.createdBy.lastName}`,
            email: form.createdBy.email,
          }
        : null,
      initiator: form.initiator
        ? {
            id: form.initiator._id,
            name: `${form.initiator.firstName} ${form.initiator.lastName}`,
            email: form.initiator.email,
          }
        : null,
      reviewer: form.reviewer
        ? {
            id: form.reviewer._id,
            name: `${form.reviewer.firstName} ${form.reviewer.lastName}`,
            email: form.reviewer.email,
          }
        : null,
      approver: form.approver
        ? {
            id: form.approver._id,
            name: `${form.approver.firstName} ${form.approver.lastName}`,
            email: form.approver.email,
          }
        : null,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    });
  } catch (error) {
    console.error("Get form error:", error);
    res.status(500).json({
      message: "Internal server error while fetching form",
    });
  }
});

// Update form endpoint
app.put(
  "/api/forms/:id",
  authenticateToken,
  [
    body("formName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Form name must be between 1 and 100 characters"),
    body("fields")
      .optional()
      .isArray()
      .withMessage("Fields must be an array")
      .custom((fields) => {
        if (fields && fields.length > 0) {
          const fieldValidation = validateFields(fields);
          if (!fieldValidation.isValid) {
            throw new Error(fieldValidation.errors.join("; "));
          }
        }
        return true;
      }),
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

      const { id } = req.params;
      const { formName, fields, metadata, initiator, reviewer, approver } =
        req.body;

      // Validate ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "Invalid form ID format",
        });
      }

      const form = await Form.findById(id);
      if (!form || !form.isActive) {
        return res.status(404).json({
          message: "Form not found",
        });
      }

      // Check if user owns this form or is admin
      if (
        form.createdBy &&
        form.createdBy.toString() !== req.user.id &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          message: "Access denied. You can only edit your own forms.",
        });
      }

      let fieldValidationWarnings = [];

      // Get field validation warnings if fields are being updated (errors handled by express-validator)
      if (fields) {
        const fieldValidation = validateFields(fields);
        fieldValidationWarnings = fieldValidation.warnings || [];
      }

      // Update fields
      if (formName) form.formName = formName;
      if (fields) form.fields = fields;
      if (metadata) {
        form.metadata = {
          ...form.metadata,
          ...metadata,
          lastModified: new Date().toISOString(),
        };
      }
      if (initiator !== undefined) form.initiator = initiator || null;
      if (reviewer !== undefined) form.reviewer = reviewer || null;
      if (approver !== undefined) form.approver = approver || null;

      // Auto-deactivate form if it's active but no longer valid for activation
      if (form.status === "active" && fields !== undefined) {
        const validation = form.canBeActivated();
        if (!validation.isValid) {
          console.log(
            "Auto-deactivating form due to invalid state:",
            validation.errors
          );
          form.status = "inactive";
        }
      }

      await form.save();

      const response = {
        message: "Form updated successfully",
        form: {
          id: form._id,
          formName: form.formName,
          status: form.status,
          fieldCount: form.fields.length,
          metadata: form.metadata,
          updatedAt: form.updatedAt,
        },
      };

      if (fieldValidationWarnings.length > 0) {
        response.warnings = fieldValidationWarnings;
      }

      res.json(response);
    } catch (error) {
      console.error("Form update error:", error);

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
        message: "Internal server error while updating form",
      });
    }
  }
);

// Validate fields endpoint (for real-time validation)
app.post(
  "/api/forms/validate-fields",
  authenticateToken,
  [
    body("fields")
      .isArray()
      .withMessage("Fields must be an array")
      .notEmpty()
      .withMessage("Fields array cannot be empty"),
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

      const { fields } = req.body;

      // Perform comprehensive field validation
      const fieldValidation = validateFields(fields);

      res.json({
        message: "Field validation completed",
        isValid: fieldValidation.isValid,
        errors: fieldValidation.errors,
        warnings: fieldValidation.warnings,
        summary: {
          totalFields: fields.length,
          validFields: fieldValidation.isValid
            ? fields.length
            : fields.length - fieldValidation.errors.length,
          errorCount: fieldValidation.errors.length,
          warningCount: fieldValidation.warnings.length,
        },
      });
    } catch (error) {
      console.error("Field validation error:", error);
      res.status(500).json({
        message: "Internal server error during field validation",
        error: error.message,
      });
    }
  }
);

// Update form name endpoint
app.put(
  "/api/forms/:id/name",
  authenticateToken,
  [
    body("formName")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Form name must be between 3 and 100 characters"),
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

      const { id } = req.params;
      const { formName } = req.body;

      // Validate ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "Invalid form ID format",
        });
      }

      const form = await Form.findById(id);
      if (!form || !form.isActive) {
        return res.status(404).json({
          message: "Form not found",
        });
      }

      // Check if user owns this form or is admin
      if (
        form.createdBy &&
        form.createdBy.toString() !== req.user.id &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          message: "Access denied. You can only edit your own forms.",
        });
      }

      // Check if form name already exists for this user
      const existingForm = await Form.findOne({
        formName: formName,
        createdBy: req.user.id,
        isActive: true,
        _id: { $ne: id },
      });

      if (existingForm) {
        return res.status(400).json({
          message: "A form with this name already exists",
        });
      }

      form.formName = formName;
      await form.save();

      // Populate user references
      await form.populate([
        { path: "createdBy", select: "firstName lastName email" },
        { path: "initiator", select: "firstName lastName email" },
        { path: "reviewer", select: "firstName lastName email" },
        { path: "approver", select: "firstName lastName email" },
      ]);

      res.json({
        message: "Form name updated successfully",
        form: {
          id: form._id,
          formName: form.formName,
          status: form.status,
          createdBy: form.createdBy
            ? {
                id: form.createdBy._id,
                name: `${form.createdBy.firstName} ${form.createdBy.lastName}`,
                email: form.createdBy.email,
              }
            : null,
          initiator: form.initiator
            ? {
                id: form.initiator._id,
                name: `${form.initiator.firstName} ${form.initiator.lastName}`,
                email: form.initiator.email,
              }
            : null,
          reviewer: form.reviewer
            ? {
                id: form.reviewer._id,
                name: `${form.reviewer.firstName} ${form.reviewer.lastName}`,
                email: form.reviewer.email,
              }
            : null,
          approver: form.approver
            ? {
                id: form.approver._id,
                name: `${form.approver.firstName} ${form.approver.lastName}`,
                email: form.approver.email,
              }
            : null,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          fieldsCount: form.fields.length,
        },
      });
    } catch (error) {
      console.error("Form name update error:", error);
      console.error("Error stack:", error.stack);
      console.error("Form ID:", req.params.id);
      console.error("User ID:", req.user?.id);
      console.error("Request body:", req.body);

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
        message: "Internal server error while updating form name",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Update form status endpoint with validation
app.put(
  "/api/forms/:id/status",
  authenticateToken,
  [
    body("status")
      .isIn(["active", "inactive"])
      .withMessage("Status must be either 'active' or 'inactive'"),
  ],
  async (req, res) => {
    console.log("=== Form Status Update Request ===");
    console.log("Form ID:", req.params.id);
    console.log("New Status:", req.body.status);
    console.log("User ID:", req.user?.id);

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "Invalid form ID format",
        });
      }

      const form = await Form.findById(id);
      if (!form || !form.isActive) {
        return res.status(404).json({
          message: "Form not found",
        });
      }

      // Check if user owns this form or is admin
      if (
        form.createdBy &&
        form.createdBy.toString() !== req.user.id &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          message: "Access denied. You can only update your own forms.",
        });
      }

      // VALIDATION: If setting status to 'active', validate form can be activated
      if (status === "active") {
        console.log("Validating form activation...");
        console.log("Form fields:", form.fields);
        console.log("Field count:", form.fields ? form.fields.length : 0);

        const validation = form.canBeActivated();
        console.log("Validation result:", validation);

        if (!validation.isValid) {
          const primaryError = validation.errors[0];
          console.log("Validation failed, returning error");
          return res.status(400).json({
            message: `Cannot activate form: ${primaryError.message}`,
            error: primaryError.type,
            details: primaryError.details,
            allErrors: validation.errors,
          });
        }
        console.log("Validation passed, proceeding with activation");
      }

      // Update the status
      form.status = status;
      await form.save();

      // Populate user references for response
      await form.populate([
        { path: "createdBy", select: "firstName lastName email" },
        { path: "initiator", select: "firstName lastName email" },
        { path: "reviewer", select: "firstName lastName email" },
        { path: "approver", select: "firstName lastName email" },
      ]);

      res.json({
        message: `Form status updated to ${status} successfully`,
        form: {
          id: form._id,
          formName: form.formName,
          status: form.status,
          fieldCount: form.fields ? form.fields.length : 0,
          createdBy: form.createdBy
            ? {
                id: form.createdBy._id,
                name: `${form.createdBy.firstName} ${form.createdBy.lastName}`,
                email: form.createdBy.email,
              }
            : null,
          initiator: form.initiator
            ? {
                id: form.initiator._id,
                name: `${form.initiator.firstName} ${form.initiator.lastName}`,
                email: form.initiator.email,
              }
            : null,
          reviewer: form.reviewer
            ? {
                id: form.reviewer._id,
                name: `${form.reviewer.firstName} ${form.reviewer.lastName}`,
                email: form.reviewer.email,
              }
            : null,
          approver: form.approver
            ? {
                id: form.approver._id,
                name: `${form.approver.firstName} ${form.approver.lastName}`,
                email: form.approver.email,
              }
            : null,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        },
      });
    } catch (error) {
      console.error("Form status update error:", error);
      console.error("Error stack:", error.stack);
      console.error("Form ID:", req.params.id);
      console.error("User ID:", req.user?.id);
      console.error("Status:", req.body.status);

      res.status(500).json({
        message: "Internal server error while updating form status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Update form fields and metadata endpoint
app.put(
  "/api/forms/:id",
  authenticateToken,
  [
    body("formName")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Form name must be between 3 and 100 characters"),
    body("fields").optional().isArray().withMessage("Fields must be an array"),
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

      const { id } = req.params;
      const { formName, fields, metadata, initiator, reviewer, approver } =
        req.body;

      // Validate ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "Invalid form ID format",
        });
      }

      const form = await Form.findById(id);
      if (!form || !form.isActive) {
        return res.status(404).json({
          message: "Form not found",
        });
      }

      // Check if user owns this form or is admin
      if (
        form.createdBy &&
        form.createdBy.toString() !== req.user.id &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          message: "Access denied. You can only update your own forms.",
        });
      }

      // Update form fields
      if (formName !== undefined) form.formName = formName;
      if (fields !== undefined) form.fields = fields;
      if (initiator !== undefined) form.initiator = initiator;
      if (reviewer !== undefined) form.reviewer = reviewer;
      if (approver !== undefined) form.approver = approver;

      if (metadata !== undefined) {
        form.metadata = {
          ...form.metadata,
          ...metadata,
          lastModified: new Date().toISOString(),
        };
      }

      // If form is currently active and fields are being updated to empty,
      // automatically set status to inactive
      if (
        form.status === "active" &&
        fields !== undefined &&
        fields.length === 0
      ) {
        form.status = "inactive";
        console.log("Form automatically set to inactive due to no fields");
      }

      await form.save();

      // Populate user references for response
      await form.populate([
        { path: "createdBy", select: "firstName lastName email" },
        { path: "initiator", select: "firstName lastName email" },
        { path: "reviewer", select: "firstName lastName email" },
        { path: "approver", select: "firstName lastName email" },
      ]);

      res.json({
        message: "Form updated successfully",
        form: {
          id: form._id,
          formName: form.formName,
          status: form.status,
          fieldCount: form.fields ? form.fields.length : 0,
          fields: form.fields,
          metadata: form.metadata,
          createdBy: form.createdBy
            ? {
                id: form.createdBy._id,
                name: `${form.createdBy.firstName} ${form.createdBy.lastName}`,
                email: form.createdBy.email,
              }
            : null,
          initiator: form.initiator
            ? {
                id: form.initiator._id,
                name: `${form.initiator.firstName} ${form.initiator.lastName}`,
                email: form.initiator.email,
              }
            : null,
          reviewer: form.reviewer
            ? {
                id: form.reviewer._id,
                name: `${form.reviewer.firstName} ${form.reviewer.lastName}`,
                email: form.reviewer.email,
              }
            : null,
          approver: form.approver
            ? {
                id: form.approver._id,
                name: `${form.approver.firstName} ${form.approver.lastName}`,
                email: form.approver.email,
              }
            : null,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        },
      });
    } catch (error) {
      console.error("Form update error:", error);
      console.error("Error stack:", error.stack);
      console.error("Form ID:", req.params.id);
      console.error("User ID:", req.user?.id);

      res.status(500).json({
        message: "Internal server error while updating form",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Delete form endpoint (soft delete)
app.delete("/api/forms/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(id);
    if (!form || !form.isActive) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    // Check if user owns this form or is admin
    if (
      form.createdBy &&
      form.createdBy.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own forms.",
      });
    }

    await form.softDelete();

    res.json({
      message: "Form deleted successfully",
    });
  } catch (error) {
    console.error("Form delete error:", error);
    console.error("Error stack:", error.stack);
    console.error("Form ID:", req.params.id);
    console.error("User ID:", req.user?.id);

    res.status(500).json({
      message: "Internal server error while deleting form",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

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
