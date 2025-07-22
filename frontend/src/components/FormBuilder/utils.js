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

// Validate field configuration
export const validateField = (field) => {
  const errors = [];

  if (!field.name) {
    errors.push("Field name is required");
  }

  if (field.type === FIELD_TYPES.SELECT || field.type === FIELD_TYPES.RADIO) {
    if (!field.options || field.options.length === 0) {
      errors.push("Options are required for select/radio fields");
    }
  }

  return errors;
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
