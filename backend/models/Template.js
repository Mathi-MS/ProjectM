const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      minlength: [3, "Template name must be at least 3 characters"],
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    forms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Form",
      },
    ],
    approverTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Approver template is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to find active templates
TemplateSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find templates by status
TemplateSchema.statics.findByStatus = function (status) {
  return this.find({ status, isActive: true });
};

// Static method to find templates by creator
TemplateSchema.statics.findByCreator = function (userId) {
  return this.find({ createdBy: userId, isActive: true });
};

// Static method to find templates by approver
TemplateSchema.statics.findByApprover = function (userId) {
  return this.find({ approverTemplate: userId, isActive: true });
};

// Static method to find templates with specific forms
TemplateSchema.statics.findWithForm = function (formId) {
  return this.find({ forms: formId, isActive: true });
};

// Static method to check if template name exists (case-insensitive)
TemplateSchema.statics.isNameTaken = async function (
  templateName,
  excludeId = null
) {
  const query = {
    templateName: { $regex: new RegExp(`^${templateName}$`, "i") },
    isActive: true,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await this.findOne(query);
  return !!existing;
};

// Instance method to soft delete
TemplateSchema.methods.softDelete = function () {
  this.isActive = false;
  return this.save();
};

// Instance method to validate template before activation
TemplateSchema.methods.canBeActivated = async function () {
  const validation = {
    isValid: true,
    errors: [],
  };

  // Check if template has at least one form
  if (!this.forms || this.forms.length === 0) {
    validation.isValid = false;
    validation.errors.push({
      type: "NO_FORMS",
      message: "Template must have at least one form to be activated",
      details: {
        currentFormCount: this.forms ? this.forms.length : 0,
        requiredFormCount: 1,
      },
    });
  } else {
    // Check if template has at least one active form
    const Form = this.constructor.model("Form");
    const activeForms = await Form.find({
      _id: { $in: this.forms },
      status: "active",
      isActive: true,
    });

    if (activeForms.length === 0) {
      validation.isValid = false;
      validation.errors.push({
        type: "NO_ACTIVE_FORMS",
        message: "Template must have at least one active form to be activated",
        details: {
          totalFormCount: this.forms.length,
          activeFormCount: activeForms.length,
          requiredActiveFormCount: 1,
        },
      });
    }
  }

  // Check if approver template is set
  if (!this.approverTemplate) {
    validation.isValid = false;
    validation.errors.push({
      type: "NO_APPROVER",
      message: "Template must have an approver template to be activated",
    });
  }

  return validation;
};

// Instance method to safely activate template
TemplateSchema.methods.activate = async function () {
  const validation = await this.canBeActivated();

  if (!validation.isValid) {
    const error = new Error(
      `Cannot activate template: ${validation.errors
        .map((e) => e.message)
        .join(", ")}`
    );
    error.name = "ValidationError";
    error.details = validation.errors;
    throw error;
  }

  this.status = "active";
  return this.save();
};

// Instance method to get template statistics
TemplateSchema.methods.getStats = async function () {
  const validation = await this.canBeActivated();

  return {
    formCount: this.forms ? this.forms.length : 0,
    hasApprover: !!this.approverTemplate,
    canBeActivated: validation.isValid,
    validationErrors: validation.errors,
    status: this.status,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Pre-save middleware to enforce business logic
TemplateSchema.pre("save", async function (next) {
  try {
    // Check if template has no forms
    const hasNoForms = !this.forms || this.forms.length === 0;

    // If trying to set status to active, run full validation
    if (this.status === "active") {
      const validation = await this.canBeActivated();

      if (!validation.isValid) {
        const error = new Error(
          `Cannot set template to active: ${validation.errors
            .map((e) => e.message)
            .join(", ")}`
        );
        error.name = "ValidationError";
        error.details = validation.errors;
        return next(error);
      }
    }

    // If no forms are provided, automatically set status to inactive
    if (hasNoForms) {
      console.log("Template has no forms, setting status to inactive");
      this.status = "inactive";
    }

    // Validate that approverTemplate exists if provided
    if (this.approverTemplate && this.isModified("approverTemplate")) {
      const User = this.constructor.model("User");
      const approverExists = await User.findById(this.approverTemplate);
      if (!approverExists) {
        const error = new Error("Specified approver template does not exist");
        error.name = "ValidationError";
        return next(error);
      }
    }

    // Validate that all referenced forms exist if forms are provided
    if (this.forms && this.forms.length > 0 && this.isModified("forms")) {
      const Form = this.constructor.model("Form");
      const formCount = await Form.countDocuments({
        _id: { $in: this.forms },
        isActive: true,
      });

      if (formCount !== this.forms.length) {
        const error = new Error(
          "One or more referenced forms do not exist or are inactive"
        );
        error.name = "ValidationError";
        return next(error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Template", TemplateSchema);
