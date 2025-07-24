import { useState, useCallback, useEffect } from "react";
import { validateField, validateFields } from "../components/FormBuilder/utils";
import validationService from "../services/validationService";

/**
 * Custom hook for form validation
 * @param {Object} options - Configuration options
 * @returns {Object} - Validation state and methods
 */
export const useFormValidation = (options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    serverValidation = false,
  } = options;

  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    fieldErrors: {},
    isValidating: false,
    lastValidated: null,
  });

  const [debounceTimer, setDebounceTimer] = useState(null);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  /**
   * Validate a single field
   * @param {Object} field - Field configuration
   * @param {string} fieldId - Field ID for tracking
   * @returns {Object} - Validation result
   */
  const validateSingleField = useCallback((field, fieldId = null) => {
    const result = validateField(field);

    if (fieldId) {
      setValidationState((prev) => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [fieldId]: result.errors,
        },
      }));
    }

    return result;
  }, []);

  /**
   * Validate all fields in a form
   * @param {Array} fields - Array of field configurations
   * @param {boolean} useServer - Whether to use server-side validation
   * @returns {Promise<Object>} - Validation result
   */
  const validateAllFields = useCallback(
    async (fields, useServer = serverValidation) => {
      setValidationState((prev) => ({ ...prev, isValidating: true }));

      try {
        let result;

        if (useServer) {
          // Use server-side validation
          const serverResult = await validationService.validateFields(fields);
          if (serverResult.success) {
            result = serverResult.data;
          } else {
            result = {
              isValid: false,
              errors: serverResult.details || [serverResult.error],
              warnings: [],
            };
          }
        } else {
          // Use client-side validation
          result = validateFields(fields);
        }

        // Create field-specific error mapping
        const fieldErrors = {};
        fields.forEach((field, index) => {
          const fieldValidation = validateField(field);
          if (!fieldValidation.isValid) {
            fieldErrors[field.id || `field_${index}`] = fieldValidation.errors;
          }
        });

        setValidationState({
          isValid: result.isValid,
          errors: result.errors || [],
          warnings: result.warnings || [],
          fieldErrors,
          isValidating: false,
          lastValidated: new Date(),
        });

        return result;
      } catch (error) {
        const errorResult = {
          isValid: false,
          errors: ["Validation failed: " + error.message],
          warnings: [],
        };

        setValidationState({
          ...errorResult,
          fieldErrors: {},
          isValidating: false,
          lastValidated: new Date(),
        });

        return errorResult;
      }
    },
    [serverValidation]
  );

  /**
   * Validate form with debouncing
   * @param {Array} fields - Array of field configurations
   * @param {boolean} immediate - Skip debouncing
   */
  const validateWithDebounce = useCallback(
    (fields, immediate = false) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (immediate) {
        validateAllFields(fields);
      } else {
        const timer = setTimeout(() => {
          validateAllFields(fields);
        }, debounceMs);

        setDebounceTimer(timer);
      }
    },
    [debounceMs, debounceTimer, validateAllFields]
  );

  /**
   * Validate form data (including form name and other properties)
   * @param {Object} formData - Complete form data
   * @returns {Promise<Object>} - Validation result
   */
  const validateFormData = useCallback(async (formData) => {
    setValidationState((prev) => ({ ...prev, isValidating: true }));

    try {
      const result = await validationService.validateForm(formData);

      if (result.success) {
        setValidationState({
          isValid: result.data.isValid,
          errors: result.data.errors || [],
          warnings: result.data.warnings || [],
          fieldErrors: {},
          isValidating: false,
          lastValidated: new Date(),
        });

        return result.data;
      } else {
        const errorResult = {
          isValid: false,
          errors: result.details || [result.error],
          warnings: [],
        };

        setValidationState({
          ...errorResult,
          fieldErrors: {},
          isValidating: false,
          lastValidated: new Date(),
        });

        return errorResult;
      }
    } catch (error) {
      const errorResult = {
        isValid: false,
        errors: ["Form validation failed: " + error.message],
        warnings: [],
      };

      setValidationState({
        ...errorResult,
        fieldErrors: {},
        isValidating: false,
        lastValidated: new Date(),
      });

      return errorResult;
    }
  }, []);

  /**
   * Clear validation state
   */
  const clearValidation = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {},
      isValidating: false,
      lastValidated: null,
    });
  }, []);

  /**
   * Get errors for a specific field
   * @param {string} fieldId - Field ID
   * @returns {Array} - Array of error messages
   */
  const getFieldErrors = useCallback(
    (fieldId) => {
      return validationState.fieldErrors[fieldId] || [];
    },
    [validationState.fieldErrors]
  );

  /**
   * Check if a specific field has errors
   * @param {string} fieldId - Field ID
   * @returns {boolean} - Whether field has errors
   */
  const hasFieldErrors = useCallback(
    (fieldId) => {
      const errors = validationState.fieldErrors[fieldId];
      return errors && errors.length > 0;
    },
    [validationState.fieldErrors]
  );

  /**
   * Validate field dependencies
   * @param {Array} fields - Array of field configurations
   * @returns {Object} - Dependency validation result
   */
  const validateDependencies = useCallback((fields) => {
    return validationService.validateFieldDependencies(fields);
  }, []);

  /**
   * Validate form steps
   * @param {Array} fields - Array of field configurations
   * @returns {Object} - Step validation result
   */
  const validateSteps = useCallback((fields) => {
    return validationService.validateFormSteps(fields);
  }, []);

  return {
    // State
    validationState,
    isValid: validationState.isValid,
    errors: validationState.errors,
    warnings: validationState.warnings,
    fieldErrors: validationState.fieldErrors,
    isValidating: validationState.isValidating,
    lastValidated: validationState.lastValidated,

    // Methods
    validateSingleField,
    validateAllFields,
    validateWithDebounce,
    validateFormData,
    clearValidation,
    getFieldErrors,
    hasFieldErrors,
    validateDependencies,
    validateSteps,
  };
};

export default useFormValidation;
