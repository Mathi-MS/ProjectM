// Test script to verify step functionality
import { FIELD_TYPES } from "./components/FormBuilder/constants.js";
import { createField } from "./components/FormBuilder/utils.js";

// Test the step functionality
console.log("Testing Step Functionality");

// Test 1: Check if STEP field type is defined
console.log("STEP field type:", FIELD_TYPES.STEP);

// Test 2: Create a step field
const stepField = createField(FIELD_TYPES.STEP);
console.log("Created step field:", stepField);

// Test 3: Simulate adding 10 fields and then check auto-step creation logic
const fields = [];
for (let i = 1; i <= 10; i++) {
  const field = createField(FIELD_TYPES.TEXT);
  field.label = `Field ${i}`;
  fields.push(field);
}

console.log("Created 10 fields:", fields.length);

// Test 4: Check if we need to auto-create step (this would be the logic from FormBuilder)
const shouldAutoCreateStep = (currentFields, fieldType) => {
  // Don't auto-create step for layout/control fields
  if (
    fieldType === FIELD_TYPES.STEP ||
    fieldType === FIELD_TYPES.HEADER ||
    fieldType === FIELD_TYPES.PARAGRAPH ||
    fieldType === FIELD_TYPES.DIVIDER ||
    fieldType === FIELD_TYPES.SPACER
  ) {
    return false;
  }

  // Count non-layout fields in the current step
  let currentStepFieldCount = 0;
  let lastStepIndex = -1;

  // Find the last step break
  for (let i = currentFields.length - 1; i >= 0; i--) {
    if (currentFields[i].type === FIELD_TYPES.STEP) {
      lastStepIndex = i;
      break;
    }
  }

  // Count fields after the last step break (or from beginning if no step break)
  for (let i = lastStepIndex + 1; i < currentFields.length; i++) {
    if (
      currentFields[i].type !== FIELD_TYPES.STEP &&
      currentFields[i].type !== FIELD_TYPES.HEADER &&
      currentFields[i].type !== FIELD_TYPES.PARAGRAPH &&
      currentFields[i].type !== FIELD_TYPES.DIVIDER &&
      currentFields[i].type !== FIELD_TYPES.SPACER
    ) {
      currentStepFieldCount++;
    }
  }

  return currentStepFieldCount >= 10;
};

// Test adding the 11th field
const shouldCreateStep = shouldAutoCreateStep(fields, FIELD_TYPES.TEXT);
console.log(
  "Should auto-create step when adding 11th field:",
  shouldCreateStep
);

// Test with 9 fields
const fields9 = fields.slice(0, 9);
const shouldCreateStepWith9 = shouldAutoCreateStep(fields9, FIELD_TYPES.TEXT);
console.log(
  "Should auto-create step when adding 10th field (9 existing):",
  shouldCreateStepWith9
);

console.log("Step functionality test completed!");
