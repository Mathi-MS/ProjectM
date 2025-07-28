// Example of how to use the validation in your frontend

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

// 2. When creating/updating a template
async function saveTemplate(templateData) {
  try {
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (
        data.message.includes("Template must have at least one active form")
      ) {
        showError("Cannot activate template: No active forms available");
        return false;
      }
    }

    return data;
  } catch (error) {
    console.error("Error saving template:", error);
    return false;
  }
}

// 3. Check template validation status before showing UI
async function checkTemplateCanBeActivated(templateId) {
  try {
    const response = await fetch(`/api/templates/${templateId}/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const validation = await response.json();

    return {
      canActivate: validation.isValid,
      errors: validation.errors,
      hasActiveForms: !validation.errors.some(
        (e) => e.type === "NO_ACTIVE_FORMS"
      ),
    };
  } catch (error) {
    console.error("Error checking template validation:", error);
    return { canActivate: false, errors: [], hasActiveForms: false };
  }
}

// 4. React component example
function TemplateActivationButton({
  templateId,
  currentStatus,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [canActivate, setCanActivate] = useState(true);

  useEffect(() => {
    if (currentStatus === "inactive") {
      checkTemplateCanBeActivated(templateId).then((validation) => {
        setCanActivate(validation.canActivate);
      });
    }
  }, [templateId, currentStatus]);

  const handleToggleStatus = async () => {
    setLoading(true);
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const success = await activateTemplate(templateId);
    if (success) {
      onStatusChange(newStatus);
    }

    setLoading(false);
  };

  return (
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
  );
}
