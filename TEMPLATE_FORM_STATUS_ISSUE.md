# Template Form Status Issue & Solution

## The Problem

When a template contains forms with **inactive** status, and you make changes to those forms, template validation is triggered. The validation fails because:

1. **Template activation requires at least one ACTIVE form** (line 119-130 in `Template.js`)
2. **Forms with inactive status don't count** towards template activation
3. **Any changes to template trigger validation** if trying to activate

## Current Validation Logic

From `backend/models/Template.js`:

```javascript
// Template requires at least one ACTIVE form to be activated
const activeForms = await Form.find({
  _id: { $in: this.forms },
  status: "active", // Only ACTIVE forms count!
  isActive: true,
});

if (activeForms.length === 0) {
  validation.isValid = false;
  validation.errors.push({
    type: "NO_ACTIVE_FORMS",
    message: "Template must have at least one active form to be activated",
  });
}
```

## Solutions

### Option 1: Activate Forms Before Activating Template

**Workflow**:

1. First activate the forms you want to include
2. Then activate the template

```javascript
// 1. Activate the form first
async function activateFormForTemplate(formId) {
  try {
    const response = await fetch(`/api/forms/${formId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "active" }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return true;
  } catch (error) {
    console.error("Error activating form:", error);
    return false;
  }
}

// 2. Then activate template
async function activateTemplateWithForms(templateId, formIds) {
  try {
    // First, activate all required forms
    for (const formId of formIds) {
      const success = await activateFormForTemplate(formId);
      if (!success) {
        throw new Error(`Failed to activate form ${formId}`);
      }
    }

    // Then activate template
    const response = await fetch(`/api/templates/${templateId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "active" }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    showSuccess("Template activated successfully");
    return true;
  } catch (error) {
    console.error("Error activating template:", error);
    showError(error.message);
    return false;
  }
}
```

### Option 2: Check Template Status Before Making Changes

**Check template status before allowing modifications**:

```javascript
async function checkTemplateFormStatus(templateId) {
  try {
    const response = await fetch(`/api/templates/${templateId}/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const validation = await response.json();

    return {
      canActivate: validation.isValid,
      hasActiveForms: !validation.errors.some(
        (error) => error.type === "NO_ACTIVE_FORMS"
      ),
      errors: validation.errors,
    };
  } catch (error) {
    console.error("Error checking template status:", error);
    return { canActivate: false, hasActiveForms: false, errors: [] };
  }
}

// Use before making changes
async function beforeModifyingTemplate(templateId) {
  const status = await checkTemplateFormStatus(templateId);

  if (!status.hasActiveForms) {
    showWarning(
      "This template has no active forms. You'll need to activate at least one form before activating the template."
    );
  }

  return status;
}
```

### Option 3: Frontend Validation Component

```javascript
function TemplateStatusIndicator({ templateId, forms }) {
  const [templateStatus, setTemplateStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTemplateFormStatus(templateId).then((status) => {
      setTemplateStatus(status);
      setLoading(false);
    });
  }, [templateId, forms]);

  if (loading) return <CircularProgress size={20} />;

  const activeForms = forms.filter((form) => form.status === "active");
  const inactiveForms = forms.filter((form) => form.status === "inactive");

  return (
    <div>
      <Typography variant="body2">
        <strong>Template Status:</strong>{" "}
        {templateStatus?.canActivate ? "Ready" : "Not Ready"}
      </Typography>

      <Typography variant="body2">
        <strong>Active Forms:</strong> {activeForms.length}
      </Typography>

      <Typography variant="body2">
        <strong>Inactive Forms:</strong> {inactiveForms.length}
      </Typography>

      {!templateStatus?.canActivate && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          <AlertTitle>Cannot Activate Template</AlertTitle>
          {templateStatus?.errors.map((error, index) => (
            <div key={index}>• {error.message}</div>
          ))}
        </Alert>
      )}

      {inactiveForms.length > 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <AlertTitle>Inactive Forms</AlertTitle>
          To activate this template, first activate at least one of these forms:
          <ul>
            {inactiveForms.map((form) => (
              <li key={form.id}>{form.formName}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}
```

## Recommended Approach

**Use Option 1** - Activate forms first, then template:

1. **Create a workflow** where users activate forms before activating templates
2. **Show clear messages** about what needs to be activated
3. **Provide buttons** to activate forms directly from template view
4. **Update UI** to reflect the relationship between form and template status

## Example Implementation

```javascript
function TemplateActivationWorkflow({ template, onStatusChange }) {
  const [activatingForms, setActivatingForms] = useState([]);

  const handleActivateTemplate = async () => {
    // Get inactive forms that need activation
    const inactiveForms = template.forms.filter(
      (form) => form.status === "inactive"
    );

    if (inactiveForms.length > 0) {
      const shouldActivateForms = await showConfirmation(
        `This template has ${inactiveForms.length} inactive forms. 
         Would you like to activate them first?`
      );

      if (shouldActivateForms) {
        setActivatingForms(inactiveForms.map((f) => f.id));

        // Activate all inactive forms
        for (const form of inactiveForms) {
          await activateFormForTemplate(form.id);
        }

        setActivatingForms([]);
      }
    }

    // Now activate template
    const success = await activateTemplate(template.id);
    if (success) {
      onStatusChange("active");
    }
  };

  return (
    <Button
      onClick={handleActivateTemplate}
      disabled={activatingForms.length > 0}
    >
      {activatingForms.length > 0 ? "Activating Forms..." : "Activate Template"}
    </Button>
  );
}
```
