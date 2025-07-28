# Template-Form Validation Implementation

## Overview

This implementation ensures that templates can only be activated if they have at least one active form. When all forms in a template become inactive, the template is automatically set to inactive status.

## Key Features

### 1. Template Activation Validation

- Templates can only be set to "active" status if they have at least one form with `status: "active"`
- Validation is enforced at the model level using pre-save middleware
- Validation is also enforced at the API level for additional security

### 2. Automatic Template Deactivation

- When a form's status changes from "active" to "inactive", all templates containing that form are checked
- If a template has no remaining active forms, it is automatically set to "inactive"
- This is handled by post-save middleware on the Form model

### 3. Enhanced Validation Methods

- `Template.canBeActivated()` - Async method that checks all requirements for activation
- `Template.activate()` - Safe activation method that validates before activating
- `Template.getStats()` - Returns detailed statistics including validation status

## Implementation Details

### Template Model Changes (`backend/models/Template.js`)

#### Enhanced `canBeActivated()` Method

```javascript
TemplateSchema.methods.canBeActivated = async function () {
  // Checks for:
  // 1. At least one form exists
  // 2. At least one form has status: "active"
  // 3. Approver template is set
};
```

#### Pre-save Middleware

```javascript
TemplateSchema.pre("save", async function (next) {
  // Validates full requirements when setting status to "active"
  // Automatically sets status to "inactive" if no forms exist
}
```

### Form Model Changes (`backend/models/Form.js`)

#### Post-save Middleware

```javascript
FormSchema.post("save", async function (doc) {
  // When form status changes, checks all templates containing this form
  // Automatically deactivates templates with no active forms
}
```

### API Endpoint Changes (`backend/index.js`)

#### Enhanced Template Status Update

- Added validation before allowing activation
- Returns detailed error messages with validation details

#### New Validation Endpoint

- `GET /api/templates/:id/validate` - Returns validation status and details
- Useful for frontend validation and debugging

## Validation Rules

### Template Activation Requirements

1. **Form Requirement**: Must have at least one form
2. **Active Form Requirement**: Must have at least one form with `status: "active"`
3. **Approver Requirement**: Must have an approver template set

### Automatic Deactivation Triggers

1. When the last active form in a template becomes inactive
2. When forms are removed from a template leaving no active forms

## Error Handling

### Validation Error Types

- `NO_FORMS`: Template has no forms
- `NO_ACTIVE_FORMS`: Template has forms but none are active
- `NO_APPROVER`: Template has no approver set

### API Error Responses

```javascript
{
  "message": "Cannot activate template",
  "errors": [
    {
      "type": "NO_ACTIVE_FORMS",
      "message": "Template must have at least one active form to be activated",
      "details": {
        "totalFormCount": 2,
        "activeFormCount": 0,
        "requiredActiveFormCount": 1
      }
    }
  ]
}
```

## Testing

### Test Script

Run `node test-template-form-validation.js` to test:

1. Creating templates with active/inactive forms
2. Automatic template deactivation when forms become inactive
3. Validation method behavior
4. API endpoint responses

### Manual Testing Steps

1. Create forms with different statuses
2. Create templates with various form combinations
3. Try to activate templates with only inactive forms
4. Change form statuses and observe template behavior

## Usage Examples

### Frontend Validation

```javascript
// Check if template can be activated before showing activation button
const response = await fetch(`/api/templates/${templateId}/validate`);
const validation = await response.json();

if (validation.validation.canBeActivated) {
  // Show activation button
} else {
  // Show validation errors
  console.log(validation.validation.errors);
}
```

### Backend Usage

```javascript
// Safely activate a template
try {
  await template.activate();
  console.log("Template activated successfully");
} catch (error) {
  console.log("Activation failed:", error.message);
  console.log("Details:", error.details);
}
```

## Benefits

1. **Data Integrity**: Ensures templates are only active when they have usable forms
2. **Automatic Management**: Reduces manual intervention by auto-deactivating templates
3. **Clear Feedback**: Provides detailed validation messages for troubleshooting
4. **Consistent State**: Maintains consistent state between templates and forms
5. **User Experience**: Prevents confusion by ensuring only functional templates are active

## Migration Notes

If you have existing data:

1. Existing templates with inactive forms will be automatically validated on save
2. Templates that don't meet requirements will be set to inactive
3. No data loss occurs - only status changes
4. Run validation checks after deployment to identify any issues
