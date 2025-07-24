const { body } = require("express-validator");

// Define all valid field types
const VALID_FIELD_TYPES = [
  "text", "email", "number", "date", "time", "week", "color", "password", "url", "tel",
  "textarea", "select", "multiselect", "checkbox", "radio", "switch", "file", "rating",
  "header", "paragraph", "divider", "spacer", "hidden", "step"
];

// Define field types that require labels
const FIELD_TYPES_REQUIRING_LABEL = [
  "text", "email", "number", "date", "time", "week", "color", "password", "url", "tel",
  "textarea", "select", "multiselect", "checkbox", "radio", "switch", "file", "rating"
];

// Define field types that require options
const FIELD_TYPES_REQUIRING_OPTIONS = ["select", "multiselect", "radio"];

// Define field types that require placeholder
const FIELD_TYPES_REQUIRING_PLACEHOLDER = [
  "text", "email", "number", "password", "url", "tel", "textarea", "select", "multiselect"
];

// Define field types that are layout elements (don't need validation rules)
const LAYOUT_FIELD_TYPES = ["header", "paragraph", "divider", "spacer", "step"];

// Define field types that require text content
const FIELD_TYPES_REQUIRING_TEXT = ["header", "paragraph"];

// Define valid validation types
const VALID_VALIDATION_TYPES = [
  "required", "minLength", "maxLength", "min", "max", "pattern", "email", "url", "fileSize", "fileType"
];

// Define valid grid sizes
const VALID_GRID_SIZES = [1, 2, 3, 4, 6, 12];

/**
 * Validate a single field configuration
 * @param {Object} field - Field configuration object
 * @returns {Object} - Validation result with isValid and errors
 */
const validateField = (field) => {
  const errors = [];
  const warnings = [];

  // 1. Check if field has required basic properties
  if (!field) {
    return {
      isValid: false,
      errors: ["Field configuration is required"],
      warnings: []
    };
  }

  // 2. Validate field ID
  if (!field.id || typeof field.id !== "string" || field.id.trim() === "") {
    errors.push("Field ID is required and must be a non-empty string");
  }

  // 3. Validate field type
  if (!field.type || typeof field.type !== "string") {
    errors.push("Field type is required and must be a string");
  } else if (!VALID_FIELD_TYPES.includes(field.type)) {
    errors.push(`Invalid field type: ${field.type}. Valid types are: ${VALID_FIELD_TYPES.join(", ")}`);
  }

  // 4. Validate field name
  if (!field.name || typeof field.name !== "string" || field.name.trim() === "") {
    errors.push("Field name is required and must be a non-empty string");
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
    errors.push("Field name must start with a letter and contain only letters, numbers, and underscores");
  }

  // 5. Validate label for fields that require it
  if (FIELD_TYPES_REQUIRING_LABEL.includes(field.type)) {
    if (!field.label || typeof field.label !== "string" || field.label.trim() === "") {
      errors.push(`Label is required for ${field.type} fields`);
    } else if (field.label.length > 100) {
      errors.push("Label cannot exceed 100 characters");
    }
  }

  // 6. Validate text content for layout elements
  if (FIELD_TYPES_REQUIRING_TEXT.includes(field.type)) {
    if (!field.text || typeof field.text !== "string" || field.text.trim() === "") {
      errors.push(`Text content is required for ${field.type} fields`);
    } else if (field.text.length > 1000) {
      errors.push("Text content cannot exceed 1000 characters");
    }
  }

  // 7. Validate placeholder for applicable fields
  if (FIELD_TYPES_REQUIRING_PLACEHOLDER.includes(field.type)) {
    if (field.placeholder && typeof field.placeholder !== "string") {
      errors.push("Placeholder must be a string");
    } else if (field.placeholder && field.placeholder.length > 200) {
      errors.push("Placeholder cannot exceed 200 characters");
    }
  }

  // 8. Validate helper text
  if (field.helperText && typeof field.helperText !== "string") {
    errors.push("Helper text must be a string");
  } else if (field.helperText && field.helperText.length > 500) {
    errors.push("Helper text cannot exceed 500 characters");
  }

  // 9. Validate required property
  if (field.required !== undefined && typeof field.required !== "boolean") {
    errors.push("Required property must be a boolean");
  }

  // 10. Validate grid size
  if (field.gridSize !== undefined) {
    if (!Number.isInteger(field.gridSize) || !VALID_GRID_SIZES.includes(field.gridSize)) {
      errors.push(`Grid size must be one of: ${VALID_GRID_SIZES.join(", ")}`);
    }
  }

  // 11. Validate options for fields that require them
  if (FIELD_TYPES_REQUIRING_OPTIONS.includes(field.type)) {
    if (!field.options || !Array.isArray(field.options)) {
      errors.push(`Options array is required for ${field.type} fields`);
    } else if (field.options.length === 0) {
      errors.push(`At least one option is required for ${field.type} fields`);
    } else {
      // Validate each option
      field.options.forEach((option, index) => {
        if (!option || typeof option !== "object") {
          errors.push(`Option ${index + 1} must be an object`);
        } else {
          if (!option.label || typeof option.label !== "string" || option.label.trim() === "") {
            errors.push(`Option ${index + 1} must have a non-empty label`);
          }
          if (option.value === undefined || option.value === null || option.value === "") {
            errors.push(`Option ${index + 1} must have a value`);
          }
        }
      });

      // Check for duplicate values
      const values = field.options.map(opt => opt.value);
      const uniqueValues = [...new Set(values)];
      if (values.length !== uniqueValues.length) {
        errors.push("Option values must be unique");
      }
    }
  }

  // 12. Validate specific field type properties
  switch (field.type) {
    case "textarea":
      if (field.rows !== undefined) {
        if (!Number.isInteger(field.rows) || field.rows < 1 || field.rows > 20) {
          errors.push("Textarea rows must be an integer between 1 and 20");
        }
      }
      break;

    case "file":
      if (field.multiple !== undefined && typeof field.multiple !== "boolean") {
        errors.push("File multiple property must be a boolean");
      }
      break;

    case "rating":
      if (field.max !== undefined) {
        if (!Number.isInteger(field.max) || field.max < 1 || field.max > 10) {
          errors.push("Rating max value must be an integer between 1 and 10");
        }
      }
      break;

    case "header":
      if (field.variant && !["h1", "h2", "h3", "h4", "h5", "h6"].includes(field.variant)) {
        errors.push("Header variant must be one of: h1, h2, h3, h4, h5, h6");
      }
      if (field.align && !["left", "center", "right"].includes(field.align)) {
        errors.push("Header align must be one of: left, center, right");
      }
      break;

    case "paragraph":
      if (field.align && !["left", "center", "right", "justify"].includes(field.align)) {
        errors.push("Paragraph align must be one of: left, center, right, justify");
      }
      break;

    case "spacer":
      if (field.height !== undefined) {
        if (!Number.isInteger(field.height) || field.height < 1 || field.height > 200) {
          errors.push("Spacer height must be an integer between 1 and 200 pixels");
        }
      }
      break;

    case "hidden":
      if (!field.value && field.value !== 0 && field.value !== false) {
        warnings.push("Hidden field should have a default value");
      }
      break;

    case "step":
      if (field.title && field.title.length > 100) {
        errors.push("Step title cannot exceed 100 characters");
      }
      if (field.description && field.description.length > 500) {
        errors.push("Step description cannot exceed 500 characters");
      }
      break;
  }

  // 13. Validate validations object
  if (field.validations && typeof field.validations === "object") {
    Object.keys(field.validations).forEach(validationType => {
      if (!VALID_VALIDATION_TYPES.includes(validationType)) {
        errors.push(`Invalid validation type: ${validationType}`);
      } else {
        const validationValue = field.validations[validationType];
        
        switch (validationType) {
          case "minLength":
          case "maxLength":
            if (!Number.isInteger(validationValue) || validationValue < 0) {
              errors.push(`${validationType} must be a non-negative integer`);
            }
            break;
          
          case "min":
          case "max":
            if (typeof validationValue !== "number") {
              errors.push(`${validationType} must be a number`);
            }
            break;
          
          case "pattern":
            if (typeof validationValue !== "string") {
              errors.push("Pattern validation must be a string");
            } else {
              try {
                new RegExp(validationValue);
              } catch (e) {
                errors.push("Pattern validation must be a valid regular expression");
              }
            }
            break;
          
          case "email":
          case "url":
          case "required":
            if (typeof validationValue !== "boolean") {
              errors.push(`${validationType} validation must be a boolean`);
            }
            break;
          
          case "fileSize":
            if (!Number.isInteger(validationValue) || validationValue <= 0 || validationValue > 100) {
              errors.push("File size validation must be an integer between 1 and 100 MB");
            }
            break;
          
          case "fileType":
            if (!Array.isArray(validationValue) || validationValue.length === 0) {
              errors.push("File type validation must be a non-empty array");
            } else {
              validationValue.forEach(type => {
                if (typeof type !== "string" || !type.includes("/")) {
                  errors.push("File type must be a valid MIME type (e.g., 'image/jpeg')");
                }
              });
            }
            break;
        }
      }
    });

    // Cross-validation checks
    if (field.validations.minLength && field.validations.maxLength) {
      if (field.validations.minLength > field.validations.maxLength) {
        errors.push("Minimum length cannot be greater than maximum length");
      }
    }

    if (field.validations.min && field.validations.max) {
      if (field.validations.min > field.validations.max) {
        errors.push("Minimum value cannot be greater than maximum value");
      }
    }
  }

  // 14. Validate dependencies
  if (field.dependsOn && typeof field.dependsOn === "object") {
    if (!field.dependsOn.field || typeof field.dependsOn.field !== "string") {
      errors.push("Dependency field name is required and must be a string");
    }
    if (field.dependsOn.value === undefined) {
      errors.push("Dependency value is required");
    }
    if (field.dependsOn.condition && !["equals", "not_equals", "contains", "not_empty", "empty"].includes(field.dependsOn.condition)) {
      errors.push("Dependency condition must be one of: equals, not_equals, contains, not_empty, empty");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate an array of fields
 * @param {Array} fields - Array of field configurations
 * @returns {Object} - Validation result with isValid, errors, and warnings
 */
const validateFields = (fields) => {
  const errors = [];
  const warnings = [];
  const fieldNames = new Set();
  const fieldIds = new Set();

  if (!Array.isArray(fields)) {
    return {
      isValid: false,
      errors: ["Fields must be an array"],
      warnings: []
    };
  }

  if (fields.length === 0) {
    return {
      isValid: false,
      errors: ["Form must have at least one field"],
      warnings: []
    };
  }

  // Validate each field
  fields.forEach((field, index) => {
    const fieldValidation = validateField(field);
    
    if (!fieldValidation.isValid) {
      fieldValidation.errors.forEach(error => {
        errors.push(`Field ${index + 1}: ${error}`);
      });
    }

    fieldValidation.warnings.forEach(warning => {
      warnings.push(`Field ${index + 1}: ${warning}`);
    });

    // Check for duplicate field names
    if (field.name) {
      if (fieldNames.has(field.name)) {
        errors.push(`Duplicate field name: ${field.name}`);
      } else {
        fieldNames.add(field.name);
      }
    }

    // Check for duplicate field IDs
    if (field.id) {
      if (fieldIds.has(field.id)) {
        errors.push(`Duplicate field ID: ${field.id}`);
      } else {
        fieldIds.add(field.id);
      }
    }
  });

  // Validate field dependencies
  fields.forEach((field, index) => {
    if (field.dependsOn && field.dependsOn.field) {
      const dependentFieldExists = fields.some(f => f.name === field.dependsOn.field);
      if (!dependentFieldExists) {
        errors.push(`Field ${index + 1}: Dependent field '${field.dependsOn.field}' does not exist`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Express validator middleware for form fields
 */
const validateFormFields = () => {
  return [
    body("fields")
      .isArray()
      .withMessage("Fields must be an array")
      .custom((fields) => {
        const validation = validateFields(fields);
        if (!validation.isValid) {
          throw new Error(validation.errors.join("; "));
        }
        return true;
      })
  ];
};

/**
 * Express validator middleware for individual field
 */
const validateSingleField = () => {
  return [
    body("field")
      .isObject()
      .withMessage("Field must be an object")
      .custom((field) => {
        const validation = validateField(field);
        if (!validation.isValid) {
          throw new Error(validation.errors.join("; "));
        }
        return true;
      })
  ];
};

module.exports = {
  validateField,
  validateFields,
  validateFormFields,
  validateSingleField,
  VALID_FIELD_TYPES,
  FIELD_TYPES_REQUIRING_LABEL,
  FIELD_TYPES_REQUIRING_OPTIONS,
  FIELD_TYPES_REQUIRING_PLACEHOLDER,
  LAYOUT_FIELD_TYPES,
  VALID_VALIDATION_TYPES,
  VALID_GRID_SIZES
};