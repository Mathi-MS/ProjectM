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

  // Special fields
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

export const DEFAULT_FIELD_CONFIG = {
  [FIELD_TYPES.TEXT]: {
    type: FIELD_TYPES.TEXT,
    label: "Text Input",
    placeholder: "Enter text",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.EMAIL]: {
    type: FIELD_TYPES.EMAIL,
    label: "Email",
    placeholder: "Enter email",
    required: false,
    gridSize: 6,
    validations: { email: true },
  },
  [FIELD_TYPES.NUMBER]: {
    type: FIELD_TYPES.NUMBER,
    label: "Number",
    placeholder: "Enter number",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.DATE]: {
    type: FIELD_TYPES.DATE,
    label: "Date",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.TIME]: {
    type: FIELD_TYPES.TIME,
    label: "Time",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.WEEK]: {
    type: FIELD_TYPES.WEEK,
    label: "Week",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.COLOR]: {
    type: FIELD_TYPES.COLOR,
    label: "Color",
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.TEXTAREA]: {
    type: FIELD_TYPES.TEXTAREA,
    label: "Textarea",
    placeholder: "Enter text",
    required: false,
    gridSize: 12,
    rows: 4,
    validations: {},
  },
  [FIELD_TYPES.SELECT]: {
    type: FIELD_TYPES.SELECT,
    label: "Select",
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
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.RADIO]: {
    type: FIELD_TYPES.RADIO,
    label: "Radio Group",
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
    required: false,
    gridSize: 6,
    validations: {},
  },
  [FIELD_TYPES.FILE]: {
    type: FIELD_TYPES.FILE,
    label: "File Upload",
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
  [FIELD_TYPES.HIDDEN]: {
    type: FIELD_TYPES.HIDDEN,
    name: "hiddenField",
    value: "",
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
  "Date & Time": [FIELD_TYPES.DATE, FIELD_TYPES.TIME, FIELD_TYPES.WEEK],
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
    FIELD_TYPES.SPACER,
  ],
  Special: [FIELD_TYPES.HIDDEN, FIELD_TYPES.STEP],
};
