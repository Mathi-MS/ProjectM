import { v4 as uuidv4 } from "uuid";
import { FIELD_TYPES, DEFAULT_FIELD_CONFIG } from "./constants";

// Generate unique field ID
export const generateFieldId = () => `field_${uuidv4()}`;

// Create new field with default configuration
export const createField = (type, overrides = {}) => {
  const defaultConfig = DEFAULT_FIELD_CONFIG[type] || {};
  return {
    id: generateFieldId(),
    name: `field_${Date.now()}`,
    ...defaultConfig,
    ...overrides,
  };
};

// Define field types that require labels
const FIELD_TYPES_REQUIRING_LABEL = [
  FIELD_TYPES.TEXT, FIELD_TYPES.EMAIL, FIELD_TYPES.NUMBER, FIELD_TYPES.DATE, 
  FIELD_TYPES.TIME, FIELD_TYPES.WEEK, FIELD_TYPES.COLOR, FIELD_TYPES.PASSWORD, 
  FIELD_TYPES.URL, FIELD_TYPES.TEL, FIELD_TYPES.TEXTAREA, FIELD_TYPES.SELECT, 
  FIELD_TYPES.MULTISELECT, FIELD_TYPES.CHECKBOX, FIELD_TYPES.RADIO, 
  FIELD_TYPES.SWITCH, FIELD_TYPES.FILE, FIELD_TYPES.RATING
];

// Define field types that require options
const FIELD_TYPES_REQUIRING_OPTIONS = [FIELD_TYPES.SELECT, FIELD_TYPES.MULTISELECT, FIELD_TYPES.RADIO];

// Define field types that require placeholder
const FIELD_TYPES_REQUIRING_PLACEHOLDER = [
  FIELD_TYPES.TEXT, FIELD_TYPES.EMAIL, FIELD_TYPES.NUMBER, FIELD_TYPES.PASSWORD, 
  FIELD_TYPES.URL, FIELD_TYPES.TEL, FIELD_TYPES.TEXTAREA, FIELD_TYPES.SELECT, 
  FIELD_TYPES.MULTISELECT
];

// Define field types that require text content
const FIELD_TYPES_REQUIRING_TEXT = [FIELD_TYPES.HEADER, FIELD_TYPES.PARAGRAPH];

// Define layout field types
const LAYOUT_FIELD_TYPES = [FIELD_TYPES.HEADER, FIELD_TYPES.PARAGRAPH, FIELD_TYPES.DIVIDER, FIELD_TYPES.SPACER, FIELD_TYPES.STEP];

// Define valid grid sizes
const VALID_GRID_SIZES = [1, 2, 3, 4, 6, 12];

// Validate field configuration
export const validateField = (field) => {
  const errors = [];
  const warnings = [];

  if (!field) {
    return {
      isValid: false,
      errors: ["Field configuration is required"],
      warnings: []
    };
  }

  // 1. Validate field ID
  if (!field.id || typeof field.id !== "string" || field.id.trim() === "") {
    errors.push("Field ID is required and must be a non-empty string");
  }

  // 2. Validate field type
  if (!field.type || typeof field.type !== "string") {
    errors.push("Field type is required and must be a string");
  } else if (!Object.values(FIELD_TYPES).includes(field.type)) {
    errors.push(`Invalid field type: ${field.type}`);
  }

  // 3. Validate field name
  if (!field.name || typeof field.name !== "string" || field.name.trim() === "") {
    errors.push("Field name is required and must be a non-empty string");
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
    errors.push("Field name must start with a letter and contain only letters, numbers, and underscores");
  }

  // 4. Validate label for fields that require it
  if (FIELD_TYPES_REQUIRING_LABEL.includes(field.type)) {
    if (!field.label || typeof field.label !== "string" || field.label.trim() === "") {
      errors.push(`Label is required for ${field.type} fields`);
    } else if (field.label.length > 100) {
      errors.push("Label cannot exceed 100 characters");
    }
  }

  // 5. Validate text content for layout elements
  if (FIELD_TYPES_REQUIRING_TEXT.includes(field.type)) {
    if (!field.text || typeof field.text !== "string" || field.text.trim() === "") {
      errors.push(`Text content is required for ${field.type} fields`);
    } else if (field.text.length > 1000) {
      errors.push("Text content cannot exceed 1000 characters");
    }
  }

  // 6. Validate placeholder for applicable fields
  if (FIELD_TYPES_REQUIRING_PLACEHOLDER.includes(field.type)) {
    if (field.placeholder && typeof field.placeholder !== "string") {
      errors.push("Placeholder must be a string");
    } else if (field.placeholder && field.placeholder.length > 200) {
      errors.push("Placeholder cannot exceed 200 characters");
    }
  }

  // 7. Validate helper text
  if (field.helperText && typeof field.helperText !== "string") {
    errors.push("Helper text must be a string");
  } else if (field.helperText && field.helperText.length > 500) {
    errors.push("Helper text cannot exceed 500 characters");
  }

  // 8. Validate required property
  if (field.required !== undefined && typeof field.required !== "boolean") {
    errors.push("Required property must be a boolean");
  }

  // 9. Validate grid size
  if (field.gridSize !== undefined) {
    if (!Number.isInteger(field.gridSize) || !VALID_GRID_SIZES.includes(field.gridSize)) {
      errors.push(`Grid size must be one of: ${VALID_GRID_SIZES.join(", ")}`);
    }
  }

  // 10. Validate options for fields that require them
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

  // 11. Validate specific field type properties
  switch (field.type) {
    case FIELD_TYPES.TEXTAREA:
      if (field.rows !== undefined) {
        if (!Number.isInteger(field.rows) || field.rows < 1 || field.rows > 20) {
          errors.push("Textarea rows must be an integer between 1 and 20");
        }
      }
      break;

    case FIELD_TYPES.FILE:
      if (field.multiple !== undefined && typeof field.multiple !== "boolean") {
        errors.push("File multiple property must be a boolean");
      }
      break;

    case FIELD_TYPES.RATING:
      if (field.max !== undefined) {
        if (!Number.isInteger(field.max) || field.max < 1 || field.max > 10) {
          errors.push("Rating max value must be an integer between 1 and 10");
        }
      }
      break;

    case FIELD_TYPES.HEADER:
      if (field.variant && !["h1", "h2", "h3", "h4", "h5", "h6"].includes(field.variant)) {
        errors.push("Header variant must be one of: h1, h2, h3, h4, h5, h6");
      }
      if (field.align && !["left", "center", "right"].includes(field.align)) {
        errors.push("Header align must be one of: left, center, right");
      }
      break;

    case FIELD_TYPES.PARAGRAPH:
      if (field.align && !["left", "center", "right", "justify"].includes(field.align)) {
        errors.push("Paragraph align must be one of: left, center, right, justify");
      }
      break;

    case FIELD_TYPES.SPACER:
      if (field.height !== undefined) {
        if (!Number.isInteger(field.height) || field.height < 1 || field.height > 200) {
          errors.push("Spacer height must be an integer between 1 and 200 pixels");
        }
      }
      break;

    case FIELD_TYPES.HIDDEN:
      if (!field.value && field.value !== 0 && field.value !== false) {
        warnings.push("Hidden field should have a default value");
      }
      break;

    case FIELD_TYPES.STEP:
      if (field.title && field.title.length > 100) {
        errors.push("Step title cannot exceed 100 characters");
      }
      if (field.description && field.description.length > 500) {
        errors.push("Step description cannot exceed 500 characters");
      }
      break;
  }

  // 12. Validate validations object
  if (field.validations && typeof field.validations === "object") {
    const validValidationTypes = ["required", "minLength", "maxLength", "min", "max", "pattern", "email", "url", "fileSize", "fileType"];
    
    Object.keys(field.validations).forEach(validationType => {
      if (!validValidationTypes.includes(validationType)) {
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

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate an array of fields
export const validateFields = (fields) => {
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

// Generate validation schema for react-hook-form
export const generateValidationSchema = (fields) => {
  const schema = {};

  fields.forEach((field) => {
    if (
      field.type === FIELD_TYPES.HEADER ||
      field.type === FIELD_TYPES.PARAGRAPH
    ) {
      return; // Skip layout elements
    }

    const validations = field.validations || {};
    const rules = {};

    if (field.required) {
      rules.required = `${field.label} is required`;
    }

    if (validations.minLength) {
      rules.minLength = {
        value: validations.minLength,
        message: `Minimum length is ${validations.minLength}`,
      };
    }

    if (validations.maxLength) {
      rules.maxLength = {
        value: validations.maxLength,
        message: `Maximum length is ${validations.maxLength}`,
      };
    }

    if (validations.min) {
      rules.min = {
        value: validations.min,
        message: `Minimum value is ${validations.min}`,
      };
    }

    if (validations.max) {
      rules.max = {
        value: validations.max,
        message: `Maximum value is ${validations.max}`,
      };
    }

    if (validations.pattern) {
      rules.pattern = {
        value: new RegExp(validations.pattern),
        message: validations.patternMessage || "Invalid format",
      };
    }

    if (validations.email) {
      rules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      };
    }

    if (validations.url) {
      rules.pattern = {
        value: /^https?:\/\/.+/,
        message: "Invalid URL",
      };
    }

    schema[field.name] = rules;
  });

  return schema;
};

// Check if field depends on another field
export const checkFieldDependency = (field, formData) => {
  if (!field.dependsOn) return true;

  const {
    field: dependentField,
    value: expectedValue,
    condition = "equals",
  } = field.dependsOn;
  const actualValue = formData[dependentField];

  switch (condition) {
    case "equals":
      return actualValue === expectedValue;
    case "not_equals":
      return actualValue !== expectedValue;
    case "contains":
      return Array.isArray(actualValue)
        ? actualValue.includes(expectedValue)
        : false;
    case "not_empty":
      return actualValue && actualValue.length > 0;
    case "empty":
      return !actualValue || actualValue.length === 0;
    default:
      return true;
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Validate file
export const validateFile = (file, validations) => {
  const errors = [];

  if (validations.fileType && validations.fileType.length > 0) {
    if (!validations.fileType.includes(file.type)) {
      errors.push(
        `File type must be one of: ${validations.fileType.join(", ")}`
      );
    }
  }

  if (validations.fileSize) {
    const maxSizeBytes = validations.fileSize * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${validations.fileSize}MB`);
    }
  }

  return errors;
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate form steps
export const generateFormSteps = (fields) => {
  const steps = [];
  let currentStep = { title: "Step 1", fields: [] };

  fields.forEach((field) => {
    if (field.type === FIELD_TYPES.STEP) {
      if (currentStep.fields.length > 0) {
        steps.push(currentStep);
      }
      currentStep = {
        title: field.title || `Step ${steps.length + 2}`,
        fields: [],
      };
    } else {
      currentStep.fields.push(field);
    }
  });

  if (currentStep.fields.length > 0) {
    steps.push(currentStep);
  }

  return steps.length > 0 ? steps : [{ title: "Form", fields }];
};

// Serialize form data for display, converting File objects to readable format
export const serializeFormData = (data) => {
  const serialized = {};

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof File) {
      // Single file
      serialized[key] = {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: new Date(value.lastModified).toISOString(),
        sizeFormatted: formatFileSize(value.size),
      };
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] instanceof File
    ) {
      // Array of files
      serialized[key] = value.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
        sizeFormatted: formatFileSize(file.size),
      }));
    } else {
      // Regular value
      serialized[key] = value;
    }
  }

  return serialized;
};
