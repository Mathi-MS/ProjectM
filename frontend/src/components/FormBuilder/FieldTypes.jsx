import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Grid,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  TextFields,
  Email,
  Numbers,
  CalendarToday,
  AccessTime,
  DateRange,
  Palette,
  Lock,
  Link,
  Phone,
  Subject,
  ArrowDropDownCircle,
  CheckBox,
  RadioButtonChecked,
  ToggleOn,
  CloudUpload,
  Star,
  Title,
  Notes,
  HorizontalRule,
  Height as Space,
  VisibilityOff,
  ViewModule,
} from "@mui/icons-material";
import { useDraggable } from "@dnd-kit/core";
import { FIELD_TYPES, FIELD_CATEGORIES } from "./constants";
import { createField } from "./utils";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const fieldIcons = {
  [FIELD_TYPES.TEXT]: TextFields,
  [FIELD_TYPES.EMAIL]: Email,
  [FIELD_TYPES.NUMBER]: Numbers,
  [FIELD_TYPES.DATE]: CalendarToday,
  [FIELD_TYPES.TIME]: AccessTime,
  [FIELD_TYPES.WEEK]: DateRange,
  [FIELD_TYPES.COLOR]: Palette,
  [FIELD_TYPES.PASSWORD]: Lock,
  [FIELD_TYPES.URL]: Link,
  [FIELD_TYPES.TEL]: Phone,
  [FIELD_TYPES.TEXTAREA]: Subject,
  [FIELD_TYPES.SELECT]: ArrowDropDownCircle,
  [FIELD_TYPES.MULTISELECT]: ArrowDropDownCircle,
  [FIELD_TYPES.CHECKBOX]: CheckBox,
  [FIELD_TYPES.RADIO]: RadioButtonChecked,
  [FIELD_TYPES.SWITCH]: ToggleOn,
  [FIELD_TYPES.FILE]: CloudUpload,
  [FIELD_TYPES.RATING]: Star,
  [FIELD_TYPES.HEADER]: Title,
  [FIELD_TYPES.PARAGRAPH]: Notes,
  [FIELD_TYPES.DIVIDER]: HorizontalRule,
  [FIELD_TYPES.SPACER]: Space,
  [FIELD_TYPES.HIDDEN]: VisibilityOff,
  [FIELD_TYPES.STEP]: ViewModule,
};

const DraggableFieldType = ({ type, label, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `field-type-${type}`,
      data: {
        type: "field-type",
        fieldType: type,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const IconComponent = fieldIcons[type] || TextFields;

  const handleClick = (e) => {
    // Only handle click if not currently dragging
    if (!isDragging) {
      onAdd(type);
    }
  };

  return (
    <Button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      variant="outlined"
      fullWidth
      startIcon={<IconComponent />}
      onClick={handleClick}
      sx={{
        justifyContent: "flex-start",
        textTransform: "none",
        mb: 1,
        cursor: isDragging ? "grabbing" : "grab",
        "&:hover": {
          backgroundColor: "primary.light",
          color: "white",
        },
      }}
    >
      {label}
    </Button>
  );
};

const FieldTypes = ({ onAddField }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
    const handleBack = () => {
    navigate("/app/create-form");
  };
  const handleAddField = (type) => {
    onAddField(type);
  };

  const getFieldLabel = (type) => {
    const labels = {
      [FIELD_TYPES.TEXT]: "Text Input",
      [FIELD_TYPES.EMAIL]: "Email",
      [FIELD_TYPES.NUMBER]: "Number",
      [FIELD_TYPES.DATE]: "Date",
      [FIELD_TYPES.TIME]: "Time",
      [FIELD_TYPES.WEEK]: "Week",
      [FIELD_TYPES.COLOR]: "Color Picker",
      [FIELD_TYPES.PASSWORD]: "Password",
      [FIELD_TYPES.URL]: "URL",
      [FIELD_TYPES.TEL]: "Phone",
      [FIELD_TYPES.TEXTAREA]: "Textarea",
      [FIELD_TYPES.SELECT]: "Select",
      [FIELD_TYPES.MULTISELECT]: "Multi Select",
      [FIELD_TYPES.CHECKBOX]: "Checkbox",
      [FIELD_TYPES.RADIO]: "Radio Group",
      [FIELD_TYPES.SWITCH]: "Switch",
      [FIELD_TYPES.FILE]: "File Upload",
      [FIELD_TYPES.RATING]: "Rating",
      [FIELD_TYPES.HEADER]: "Header",
      [FIELD_TYPES.PARAGRAPH]: "Paragraph",
      [FIELD_TYPES.DIVIDER]: "Divider",
      [FIELD_TYPES.SPACER]: "Spacer",
      [FIELD_TYPES.HIDDEN]: "Hidden Field",
      [FIELD_TYPES.STEP]: "Step Break",
    };
    return labels[type] || type;
  };

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : 300,
        p: 2,
        borderRight: isMobile ? 0 : 1,
        borderColor: "divider",
        height: isMobile ? "auto" : "100vh",
        overflow: "auto",
        maxHeight: isMobile ? "calc(100vh - 120px)" : "100vh",
      }}
    > 
      <Box 
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          gap: 1,
        }}>
        <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              borderColor: "#457860",
              borderRadius: "200px",
              color: "#457860",
              padding:"0px",
              width: "35px",
              height: "35px",
              minWidth:"max-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                borderColor: "#2d5a3d",
                backgroundColor: "rgba(69, 120, 96, 0.04)",
              },
              "& span": {
                margin:"0px"
              },
              
            }}
          >
          </Button>
      <Typography variant="h6" gutterBottom>
        Field Types
      </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isMobile ? "Tap to add fields" : "Drag fields to the form or click to add"}
      </Typography>

      {Object.entries(FIELD_CATEGORIES).map(([category, fields]) => (
        <Accordion key={category} defaultExpanded={!isMobile}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">
              {category}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {fields.map((type) => (
                <Tooltip
                  key={type}
                  title={`Add ${getFieldLabel(type)}`}
                  placement={isMobile ? "top" : "right"}
                >
                  <Box>
                    <DraggableFieldType
                      type={type}
                      label={getFieldLabel(type)}
                      onAdd={handleAddField}
                    />
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FieldTypes;
