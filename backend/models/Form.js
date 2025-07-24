const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const FormSchema = new mongoose.Schema(
  {
    formName: {
      type: String,
      required: [true, "Form name is required"],
      trim: true,
      minlength: [3, "Form name must be at least 3 characters"],
      maxlength: [100, "Form name cannot exceed 100 characters"],
    },
    publicId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
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
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
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

// Static method to find forms by initiator
FormSchema.statics.findByInitiator = function (userId) {
  return this.find({ initiator: userId, isActive: true });
};

// Static method to find forms by reviewer
FormSchema.statics.findByReviewer = function (userId) {
  return this.find({ reviewer: userId, isActive: true });
};

// Static method to find forms by approver
FormSchema.statics.findByApprover = function (userId) {
  return this.find({ approver: userId, isActive: true });
};

// Instance method to soft delete
FormSchema.methods.softDelete = function () {
  this.isActive = false;
  return this.save();
};

// Instance method to validate if form can be activated
FormSchema.methods.canBeActivated = function () {
  const validation = {
    isValid: true,
    errors: [],
  };

  // Check if form has at least one field
  if (!this.fields || this.fields.length === 0) {
    validation.isValid = false;
    validation.errors.push({
      type: "NO_FIELDS",
      message: "Form must have at least one field to be activated",
      details: {
        currentFieldCount: this.fields ? this.fields.length : 0,
        requiredFieldCount: 1,
      },
    });
  }

  // Check if all fields are properly configured
  if (this.fields && this.fields.length > 0) {
    const invalidFields = this.fields.filter(
      (field) => !field.type || !field.label || field.label.trim() === ""
    );

    if (invalidFields.length > 0) {
      validation.isValid = false;
      validation.errors.push({
        type: "INVALID_FIELDS",
        message: "All fields must have a valid type and label",
        details: {
          invalidFieldCount: invalidFields.length,
          totalFieldCount: this.fields.length,
          invalidFields: invalidFields.map((field) => ({
            id: field.id,
            issues: [
              !field.type ? "Missing type" : null,
              !field.label || field.label.trim() === ""
                ? "Missing or empty label"
                : null,
            ].filter(Boolean),
          })),
        },
      });
    }
  }

  return validation;
};

// Instance method to get form statistics
FormSchema.methods.getStats = function () {
  return {
    fieldCount: this.fields ? this.fields.length : 0,
    hasValidFields: this.fields
      ? this.fields.every(
          (field) => field.type && field.label && field.label.trim() !== ""
        )
      : false,
    canBeActivated: this.canBeActivated().isValid,
    status: this.status,
    isActive: this.isActive,
  };
};

module.exports = mongoose.model("Form", FormSchema);
