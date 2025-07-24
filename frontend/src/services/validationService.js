import api from "../Interceptors/Interceptor";

/**
 * Validation service for form fields
 */
class ValidationService {
  /**
   * Validate fields on the server
   * @param {Array} fields - Array of field configurations
   * @returns {Promise} - Validation result
   */
  async validateFields(fields) {
    try {
      const response = await api.post("/forms/validate-fields", { fields });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Validation failed",
        details: error.response?.data?.errors || [],
      };
    }
  }

  /**
   * Validate form before saving
   * @param {Object} formData - Form data including fields
   * @returns {Promise} - Validation result
   */
  async validateForm(formData) {
    try {
      // First validate the fields
      const fieldValidation = await this.validateFields(formData.fields || []);

      if (!fieldValidation.success) {
        return fieldValidation;
      }

      // Additional form-level validation can be added here
      const errors = [];
      const warnings = [];

      // Validate form name
      if (
        !formData.formName ||
        typeof formData.formName !== "string" ||
        formData.formName.trim() === ""
      ) {
        errors.push("Form name is required");
      } else if (formData.formName.length < 3) {
        errors.push("Form name must be at least 3 characters long");
      } else if (formData.formName.length > 100) {
        errors.push("Form name cannot exceed 100 characters");
      }

      // Validate fields array
      if (!formData.fields || !Array.isArray(formData.fields)) {
        errors.push("Form must have a fields array");
      } else if (formData.fields.length === 0) {
        errors.push("Form must have at least one field");
      }

      // Combine with field validation results
      const combinedErrors = [
        ...errors,
        ...(fieldValidation.data?.errors || []),
      ];
      const combinedWarnings = [
        ...warnings,
        ...(fieldValidation.data?.warnings || []),
      ];

      return {
        success: combinedErrors.length === 0,
        data: {
          isValid: combinedErrors.length === 0,
          errors: combinedErrors,
          warnings: combinedWarnings,
          summary: {
            totalFields: formData.fields?.length || 0,
            errorCount: combinedErrors.length,
            warningCount: combinedWarnings.length,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Validation service error",
        details: [error.message],
      };
    }
  }

  /**
   * Real-time field validation (debounced)
   * @param {Object} field - Single field configuration
   * @returns {Object} - Validation result
   */
  validateFieldRealTime(field) {
    // Import the client-side validation function
    import("../components/FormBuilder/utils").then(({ validateField }) => {
      return validateField(field);
    });
  }

  /**
   * Validate field dependencies
   * @param {Array} fields - Array of field configurations
   * @returns {Object} - Dependency validation result
   */
  validateFieldDependencies(fields) {
    const errors = [];
    const warnings = [];

    fields.forEach((field, index) => {
      if (field.dependsOn && field.dependsOn.field) {
        const dependentField = fields.find(
          (f) => f.name === field.dependsOn.field
        );

        if (!dependentField) {
          errors.push(
            `Field "${
              field.label || field.name
            }" depends on non-existent field "${field.dependsOn.field}"`
          );
        } else {
          // Check for circular dependencies
          if (
            dependentField.dependsOn &&
            dependentField.dependsOn.field === field.name
          ) {
            errors.push(
              `Circular dependency detected between "${field.name}" and "${dependentField.name}"`
            );
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate form step configuration
   * @param {Array} fields - Array of field configurations
   * @returns {Object} - Step validation result
   */
  validateFormSteps(fields) {
    const errors = [];
    const warnings = [];
    const steps = [];
    let currentStep = { fields: [], index: 0 };

    fields.forEach((field, index) => {
      if (field.type === "step") {
        if (currentStep.fields.length === 0 && steps.length === 0) {
          warnings.push(
            `Step field at position ${index + 1} creates an empty first step`
          );
        }

        if (currentStep.fields.length > 0) {
          steps.push(currentStep);
        }

        currentStep = { fields: [], index: steps.length };
      } else {
        currentStep.fields.push(field);
      }
    });

    // Add the last step if it has fields
    if (currentStep.fields.length > 0) {
      steps.push(currentStep);
    }

    // Validate each step
    steps.forEach((step, stepIndex) => {
      if (step.fields.length === 0) {
        warnings.push(`Step ${stepIndex + 1} is empty`);
      }

      // Check if step has at least one required field or input field
      const hasInputFields = step.fields.some(
        (field) =>
          !["header", "paragraph", "divider", "spacer"].includes(field.type)
      );

      if (!hasInputFields) {
        warnings.push(`Step ${stepIndex + 1} has no input fields`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      steps: steps.length,
      stepsData: steps,
    };
  }
}

// Create and export a singleton instance
const validationService = new ValidationService();
export default validationService;

// Also export the class for testing purposes
export { ValidationService };
