// Field types and their configurations
export const FIELD_TYPES = {
  // Input fields
  TEXT: "text",
  EMAIL: "email",
  NUMBER: "number",
  DATE: "date",
  TIME: "time",
  WEEK: "week",
  COLOR: "color",
  PASSWORD: "password",
  URL: "url",
  TEL: "tel",

  // Complex inputs
  TEXTAREA: "textarea",
  SELECT: "select",
  MULTISELECT: "multiselect",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  SWITCH: "switch",
  FILE: "file",
  RATING: "rating",

  // Layout elements
  HEADER: "header",
  PARAGRAPH: "paragraph",
  DIVIDER: "divider",
  SPACER: "spacer",
  HIDDEN: "hidden",
  STEP: "step",
  DIVIDER: "divider",
  SPACER: "spacer",
  HIDDEN: "hidden",
  STEP: "step",
};

export const VALIDATION_TYPES = {
  REQUIRED: "required",
  MIN_LENGTH: "minLength",
  MAX_LENGTH: "maxLength",
  MIN: "min",
  MAX: "max",
  PATTERN: "pattern",
  EMAIL: "email",
  URL: "url",
  FILE_SIZE: "fileSize",
  FILE_TYPE: "fileType",
};

export const GRID_SIZES = [1, 2, 3, 4, 6, 12];

// Responsive breakpoints for grid system
export const RESPONSIVE_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Default responsive grid configurations
export const RESPONSIVE_GRID_CONFIG = {
  xs: { 1: 12, 2: 12, 3: 12, 4: 12, 6: 12, 12: 12 }, // All full width on mobile
  sm: { 1: 6, 2: 6, 3: 6, 4: 6, 6: 6, 12: 12 }, // Mostly half width on small tablets
  md: { 1: 3, 2: 4, 3: 4, 4: 6, 6: 6, 12: 12 }, // Original intended sizes on medium+
};

export const DEFAULT_FIELD_CONFIG = {
  [FIELD_TYPES.TEXT]: {
    type: FIELD_TYPES.TEXT,
    label: "Text Input",
    placeholder: "Enter text",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.EMAIL]: {
    type: FIELD_TYPES.EMAIL,
    label: "Email",
    placeholder: "Enter email",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: { email: true },
  },
  [FIELD_TYPES.NUMBER]: {
    type: FIELD_TYPES.NUMBER,
    label: "Number",
    placeholder: "Enter number",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.DATE]: {
    type: FIELD_TYPES.DATE,
    label: "Date",
    placeholder: "Select date",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.TIME]: {
    type: FIELD_TYPES.TIME,
    label: "Time",
    placeholder: "Select time",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.WEEK]: {
    type: FIELD_TYPES.WEEK,
    label: "Week",
    placeholder: "Select week",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.COLOR]: {
    type: FIELD_TYPES.COLOR,
    label: "Color",
    placeholder: "Choose color",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.TEXTAREA]: {
    type: FIELD_TYPES.TEXTAREA,
    label: "Textarea",
    placeholder: "Enter text",
    helperText: "",
    required: false,
    gridSize: 12,
    rows: 4,
    validations: {},
  },
  [FIELD_TYPES.SELECT]: {
    type: FIELD_TYPES.SELECT,
    label: "Select",
    placeholder: "Choose an option",
    helperText: "",
    required: false,
    gridSize: 6,
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
    validations: {},
  },
  [FIELD_TYPES.MULTISELECT]: {
    type: FIELD_TYPES.MULTISELECT,
    label: "Multi Select",
    placeholder: "Choose options",
    helperText: "",
    required: false,
    gridSize: 6,
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
    validations: {},
  },
  [FIELD_TYPES.CHECKBOX]: {
    type: FIELD_TYPES.CHECKBOX,
    label: "Checkbox",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.RADIO]: {
    type: FIELD_TYPES.RADIO,
    label: "Radio Group",
    helperText: "",
    required: false,
    gridSize: 6,
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
    validations: {},
  },
  [FIELD_TYPES.SWITCH]: {
    type: FIELD_TYPES.SWITCH,
    label: "Switch",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.FILE]: {
    type: FIELD_TYPES.FILE,
    label: "File Upload",
    helperText: "",
    required: false,
    gridSize: 6,
    multiple: false,
    validations: {
      fileType: ["image/png", "image/jpeg", "application/pdf"],
      fileSize: 5, // MB
    },
  },
  [FIELD_TYPES.RATING]: {
    type: FIELD_TYPES.RATING,
    label: "Rating",
    helperText: "",
    required: false,
    gridSize: 6,
    max: 5,
    validations: {},
  },
  [FIELD_TYPES.HEADER]: {
    type: FIELD_TYPES.HEADER,
    text: "Header Text",
    variant: "h4",
    gridSize: 12,
    align: "left",
  },
  [FIELD_TYPES.PARAGRAPH]: {
    type: FIELD_TYPES.PARAGRAPH,
    text: "Paragraph text goes here",
    gridSize: 12,
    align: "left",
  },
  [FIELD_TYPES.PASSWORD]: {
    type: FIELD_TYPES.PASSWORD,
    label: "Password",
    placeholder: "Enter password",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.URL]: {
    type: FIELD_TYPES.URL,
    label: "URL",
    placeholder: "Enter URL",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: { url: true },
  },
  [FIELD_TYPES.TEL]: {
    type: FIELD_TYPES.TEL,
    label: "Phone",
    placeholder: "Enter phone number",
    helperText: "",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.DIVIDER]: {
    type: FIELD_TYPES.DIVIDER,
    gridSize: 12,
  },
  [FIELD_TYPES.SPACER]: {
    type: FIELD_TYPES.SPACER,
    gridSize: 12,
    height: 20,
  },
  [FIELD_TYPES.HIDDEN]: {
    type: FIELD_TYPES.HIDDEN,
    name: "hiddenField",
    value: "",
    gridSize: 12,
  },
  [FIELD_TYPES.STEP]: {
    type: FIELD_TYPES.STEP,
    title: "Step Break",
    description: "This creates a new step/page in the form",
    gridSize: 12,
  },
  [FIELD_TYPES.DIVIDER]: {
    type: FIELD_TYPES.DIVIDER,
    gridSize: 12,
  },
  [FIELD_TYPES.SPACER]: {
    type: FIELD_TYPES.SPACER,
    gridSize: 12,
    height: 20,
  },
  [FIELD_TYPES.HIDDEN]: {
    type: FIELD_TYPES.HIDDEN,
    name: "hiddenField",
    value: "",
    gridSize: 12,
  },
  [FIELD_TYPES.STEP]: {
    type: FIELD_TYPES.STEP,
    title: "Step Break",
    description: "This creates a new step/page in the form",
    gridSize: 12,
  },
};

export const FIELD_CATEGORIES = {
  "Basic Inputs": [
    FIELD_TYPES.TEXT,
    FIELD_TYPES.EMAIL,
    FIELD_TYPES.NUMBER,
    FIELD_TYPES.PASSWORD,
    FIELD_TYPES.URL,
    FIELD_TYPES.TEL,
  ],
  "Date & Time": [FIELD_TYPES.DATE, 
    FIELD_TYPES.TIME, FIELD_TYPES.WEEK],
  Selection: [
    FIELD_TYPES.SELECT,
    FIELD_TYPES.MULTISELECT,
    FIELD_TYPES.RADIO,
    FIELD_TYPES.CHECKBOX,
    FIELD_TYPES.SWITCH,
  ],
  Advanced: [
    FIELD_TYPES.TEXTAREA,
    
    FIELD_TYPES.FILE,
    FIELD_TYPES.RATING,
    FIELD_TYPES.COLOR,
  ],
  Layout: [
    FIELD_TYPES.HEADER, 
    FIELD_TYPES.PARAGRAPH, 
    FIELD_TYPES.DIVIDER, 
    FIELD_TYPES.SPACER
  ],
  "Form Control": [
    FIELD_TYPES.STEP,
    FIELD_TYPES.HIDDEN
  ],
};
