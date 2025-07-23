const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema(
  {
    formName: {
      type: String,
      required: [true, "Form name is required"],
      trim: true,
      minlength: [3, "Form name must be at least 3 characters"],
      maxlength: [100, "Form name cannot exceed 100 characters"],
    },
    fields: {
      type: Array,
      required: [true, "Form fields are required"],
      default: [],
    },
    metadata: {
      created: {
        type: Date,
        default: Date.now,
      },
      version: {
        type: String,
        default: "1.0",
      },
      lastModified: {
        type: Date,
        default: Date.now,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for now, can be made required later
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

// Update lastModified on save
FormSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.metadata.lastModified = new Date();
  }
  next();
});

// Static method to find forms by user
FormSchema.statics.findByUser = function (userId) {
  return this.find({ createdBy: userId, isActive: true });
};

// Static method to find active forms
FormSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Instance method to soft delete
FormSchema.methods.softDelete = function () {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model("Form", FormSchema);
