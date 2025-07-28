// Example of how to use the validation in your frontend
// CORRECTED VERSION - includes required 'name' property for fields

// 1. When activating a template
async function activateTemplate(templateId) {
  try {
    const response = await fetch(`/api/templates/${templateId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "active" }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (data.errors) {
        // Show specific validation errors to user
        data.errors.forEach((error) => {
          if (error.type === "NO_ACTIVE_FORMS") {
            showError(
              "Template must have at least one active form to be activated"
            );
          }
          if (error.type === "NO_APPROVER") {
            showError("Template must have an approver to be activated");
          }
        });
      }
      return false;
    }

    showSuccess("Template activated successfully");
    return true;
  } catch (error) {
    console.error("Error activating template:", error);
    showError("Failed to activate template");
    return false;
  }
}

// 2. When creating/updating a form with fields
async function saveFormWithFields(formData) {
  try {
    const response = await fetch("/api/forms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        fields: [
          {
            id: "field1",
            name: "fullName", // REQUIRED: Field name for internal use
            type: "text",
            label: "Full Name", // Display label for users
            required: true,
            placeholder: "Enter your full name",
            validations: {
              required: true,
              minLength: 2,
              maxLength: 50,
            },
          },
          {
            id: "field2",
            name: "emailAddress", // REQUIRED: Field name for internal use
            type: "email",
            label: "Email Address", // Display label for users
            required: true,
            placeholder: "Enter your email",
            validations: {
              required: true,
              email: true,
            },
          },
          {
            id: "field3",
            name: "phoneNumber",
            type: "tel",
            label: "Phone Number",
            required: false,
            placeholder: "Enter your phone number",
            helperText: "Include country code for international numbers",
          },
          {
            id: "field4",
            name: "department",
            type: "select",
            label: "Department",
            required: true,
            options: [
              { label: "Engineering", value: "engineering" },
              { label: "Sales", value: "sales" },
              { label: "Marketing", value: "marketing" },
              { label: "Support", value: "support" },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle field validation errors
      if (data.errors) {
        data.errors.forEach((error) => {
          showError(`Validation Error: ${error.msg}`);
        });
      }
      return false;
    }

    return data;
  } catch (error) {
    console.error("Error saving form:", error);
    return false;
  }
}

// 3. Check form validation status before showing UI
async function checkFormCanBeActivated(formId) {
  try {
    const response = await fetch(`/api/forms/${formId}/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const validation = await response.json();

    return {
      canActivate: validation.isValid,
      errors: validation.errors,
      hasFields: validation.fieldCount > 0,
    };
  } catch (error) {
    console.error("Error checking form validation:", error);
    return { canActivate: false, errors: [], hasFields: false };
  }
}

// 4. Activate a form with proper error handling
async function activateForm(formId) {
  try {
    const response = await fetch(`/api/forms/${formId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "active" }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific activation errors
      if (data.error === "NO_FIELDS") {
        showError("Cannot activate form: Form must have at least one field");
      } else if (data.error === "INVALID_FIELDS") {
        showError("Cannot activate form: Some fields have validation errors");
        if (data.details && data.details.errors) {
          data.details.errors.forEach((error) => {
            showError(`Field Error: ${error}`);
          });
        }
      } else {
        showError(data.message || "Failed to activate form");
      }
      return false;
    }

    showSuccess("Form activated successfully");
    return true;
  } catch (error) {
    console.error("Error activating form:", error);
    showError("Failed to activate form");
    return false;
  }
}

// 5. React component example for form management
function FormActivationButton({ formId, currentStatus, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [canActivate, setCanActivate] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (currentStatus === "inactive") {
      checkFormCanBeActivated(formId).then((validation) => {
        setCanActivate(validation.canActivate);
        setValidationErrors(validation.errors || []);
      });
    }
  }, [formId, currentStatus]);

  const handleToggleStatus = async () => {
    setLoading(true);

    if (currentStatus === "active") {
      // Deactivate form
      const success = await deactivateForm(formId);
      if (success) {
        onStatusChange("inactive");
      }
    } else {
      // Activate form
      const success = await activateForm(formId);
      if (success) {
        onStatusChange("active");
      }
    }

    setLoading(false);
  };

  return (
    <div>
      <Button
        onClick={handleToggleStatus}
        disabled={loading || (currentStatus === "inactive" && !canActivate)}
        color={currentStatus === "active" ? "error" : "success"}
      >
        {loading
          ? "Loading..."
          : currentStatus === "active"
          ? "Deactivate"
          : "Activate"}
      </Button>

      {/* Show validation errors if form cannot be activated */}
      {currentStatus === "inactive" &&
        !canActivate &&
        validationErrors.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <Typography variant="caption" color="error">
              Cannot activate form:
            </Typography>
            <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
              {validationErrors.map((error, index) => (
                <li key={index}>
                  <Typography variant="caption" color="error">
                    {error}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

// 6. Helper function to deactivate form
async function deactivateForm(formId) {
  try {
    const response = await fetch(`/api/forms/${formId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "inactive" }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || "Failed to deactivate form");
      return false;
    }

    showSuccess("Form deactivated successfully");
    return true;
  } catch (error) {
    console.error("Error deactivating form:", error);
    showError("Failed to deactivate form");
    return false;
  }
}

// 7. Example of field validation before saving
function validateFieldConfiguration(field) {
  const errors = [];

  // Check required properties
  if (!field.id) errors.push("Field ID is required");
  if (!field.name) errors.push("Field name is required");
  if (!field.type) errors.push("Field type is required");

  // Validate field name format
  if (field.name && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
    errors.push(
      "Field name must start with a letter and contain only letters, numbers, and underscores"
    );
  }

  // Check if label is required for this field type
  const fieldTypesRequiringLabel = [
    "text",
    "email",
    "number",
    "date",
    "time",
    "week",
    "color",
    "password",
    "url",
    "tel",
    "textarea",
    "select",
    "multiselect",
    "checkbox",
    "radio",
    "switch",
    "file",
    "rating",
  ];

  if (fieldTypesRequiringLabel.includes(field.type) && !field.label) {
    errors.push(`Label is required for ${field.type} fields`);
  }

  // Check if options are required for this field type
  const fieldTypesRequiringOptions = ["select", "multiselect", "radio"];
  if (fieldTypesRequiringOptions.includes(field.type)) {
    if (
      !field.options ||
      !Array.isArray(field.options) ||
      field.options.length === 0
    ) {
      errors.push(`Options are required for ${field.type} fields`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 8. Utility functions for error display (you would implement these)
function showError(message) {
  // Implement your error display logic here
  console.error(message);
  // Example: toast.error(message);
}

function showSuccess(message) {
  // Implement your success display logic here
  console.log(message);
  // Example: toast.success(message);
}

// Export functions for use in your application
export {
  activateTemplate,
  saveFormWithFields,
  checkFormCanBeActivated,
  activateForm,
  deactivateForm,
  validateFieldConfiguration,
  FormActivationButton,
};
