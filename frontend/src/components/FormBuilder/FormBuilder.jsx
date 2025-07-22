import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Alert,
  Drawer,
  useMediaQuery,
  useTheme,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  EditNote as EditNoteIcon,
} from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import FieldTypes from "./FieldTypes";
import FieldConfig from "./FieldConfig";
import FormPreview from "./FormPreview";
import { createField, deepClone } from "./utils";
import { FIELD_TYPES } from "./constants";

const DroppableArea = ({ children, isEmpty }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "form-builder-area",
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: isEmpty ? 200 : "auto",
        border: isEmpty ? "2px dashed" : "none",
        borderColor: isOver ? "primary.main" : "grey.300",
        backgroundColor: isOver ? "primary.light" : "transparent",
        borderRadius: 1,
        p: isEmpty ? 4 : 0,
        textAlign: isEmpty ? "center" : "left",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {children}
    </Box>
  );
};

const SortableFieldItem = ({
  field,
  onEdit,
  onDelete,
  isSelected,
  isMobile,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getFieldDisplayName = (field) => {
    if (field.type === FIELD_TYPES.HEADER) return field.text || "Header";
    if (field.type === FIELD_TYPES.PARAGRAPH) return field.text || "Paragraph";
    return field.label || field.name || field.type;
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: isMobile ? 1.5 : 2,
        mb: 1,
        cursor: "pointer",
        border: isSelected ? 2 : 0,
        borderColor: "primary.main",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size={isMobile ? "medium" : "small"}
          {...attributes}
          {...listeners}
          sx={{
            cursor: "grab",
            minWidth: isMobile ? 44 : "auto",
            minHeight: isMobile ? 44 : "auto",
          }}
        >
          <DragIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getFieldDisplayName(field)}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: isMobile ? "block" : "inline",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {field.type} • Grid: {field.gridSize}/12
            {field.required && " • Required"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit Field">
            <IconButton
              size={isMobile ? "medium" : "small"}
              onClick={() => onEdit(field)}
              sx={{
                minWidth: isMobile ? 44 : "auto",
                minHeight: isMobile ? 44 : "auto",
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Field">
            <IconButton
              size={isMobile ? "medium" : "small"}
              onClick={() => onDelete(field.id)}
              color="error"
              sx={{
                minWidth: isMobile ? 44 : "auto",
                minHeight: isMobile ? 44 : "auto",
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formName, setFormName] = useState("Form Builder");
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [tempFormName, setTempFormName] = useState("");

  const [previewData, setPreviewData] = useState({});
  const [isFormComplete, setIsFormComplete] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to check if we need to auto-create a step
  const shouldAutoCreateStep = useCallback(
    (currentFields, fieldType, insertIndex = -1) => {
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

      // Find the insertion point or use end of array
      const checkIndex = insertIndex >= 0 ? insertIndex : currentFields.length;

      // Count non-layout fields in the current step (before insertion point)
      let currentStepFieldCount = 0;
      let lastStepIndex = -1;

      // Find the last step break before insertion point
      for (let i = checkIndex - 1; i >= 0; i--) {
        if (currentFields[i].type === FIELD_TYPES.STEP) {
          lastStepIndex = i;
          break;
        }
      }

      // Count fields after the last step break (or from beginning if no step break)
      for (let i = lastStepIndex + 1; i < checkIndex; i++) {
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
    },
    []
  );

  // Helper function to create auto step
  const createAutoStep = useCallback((currentStepCount) => {
    const stepBreak = createField(FIELD_TYPES.STEP);
    stepBreak.title = `Step ${Math.floor(currentStepCount / 10) + 2}`;
    return stepBreak;
  }, []);

  const handleAddField = useCallback(
    (fieldType) => {
      const newField = createField(fieldType);

      setFields((prev) => {
        const newFields = [...prev];

        // Check if we need to auto-create a step
        if (shouldAutoCreateStep(prev, fieldType)) {
          const stepBreak = createAutoStep(prev.length);
          newFields.push(stepBreak);
          toast.success(`Automatically created new step after 10 fields!`);
        }

        newFields.push(newField);
        return newFields;
      });

      setSelectedField(newField);
    },
    [shouldAutoCreateStep, createAutoStep]
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle dropping field type from sidebar
    if (active.data.current?.type === "field-type") {
      const fieldType = active.data.current.fieldType;
      const newField = createField(fieldType);

      // If dropping on the empty form area or no specific field
      if (
        over.id === "form-builder-area" ||
        !fields.find((f) => f.id === over.id)
      ) {
        setFields((prev) => {
          const newFields = [...prev];

          // Check if we need to auto-create a step
          if (shouldAutoCreateStep(prev, fieldType)) {
            const stepBreak = createAutoStep(prev.length);
            newFields.push(stepBreak);
            toast.success(`Automatically created new step after 10 fields!`);
          }

          newFields.push(newField);
          return newFields;
        });
        setSelectedField(newField);
        return;
      }

      // Find insertion index based on drop position
      const overIndex = fields.findIndex((f) => f.id === over.id);
      const insertIndex = overIndex >= 0 ? overIndex + 1 : fields.length;

      setFields((prev) => {
        const newFields = [...prev];

        // Check if we need to auto-create a step at insertion point
        if (shouldAutoCreateStep(prev, fieldType, insertIndex)) {
          const stepBreak = createAutoStep(insertIndex);
          newFields.splice(insertIndex, 0, stepBreak);
          newFields.splice(insertIndex + 1, 0, newField);
          toast.success(`Automatically created new step after 10 fields!`);
        } else {
          newFields.splice(insertIndex, 0, newField);
        }

        return newFields;
      });
      setSelectedField(newField);
      return;
    }

    // Handle reordering existing fields
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEditField = (field) => {
    setSelectedField(field);
  };

  const handleUpdateField = (updatedField) => {
    setFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
    setSelectedField(updatedField);
  };

  const handleDeleteField = (fieldId) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleCloseConfig = () => {
    setSelectedField(null);
  };

  const handleFormNameSubmit = () => {
    const trimmedName = tempFormName.trim();
    if (!trimmedName) {
      toast.error("Form name is required");
      return;
    }
    if (trimmedName.length < 3) {
      toast.error("Form name must be at least 3 characters");
      return;
    }
    if (trimmedName.length > 100) {
      toast.error("Form name cannot exceed 100 characters");
      return;
    }
    setFormName(trimmedName);
    setShowNameDialog(false);
  };

  const handleFormNameCancel = () => {
    setTempFormName("");
    setShowNameDialog(false);
  };

  const handleEditFormName = () => {
    setTempFormName(formName);
    setShowNameDialog(true);
  };

  const handleClearForm = () => {
    setFields([]);
    setSelectedField(null);
    setPreviewData({});
    setIsFormComplete(false);
  };

  const handlePreviewNext = () => {
    // Validate that all required fields are filled
    const requiredFields = fields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) =>
        !previewData[field.id] ||
        (typeof previewData[field.id] === "string" &&
          previewData[field.id].trim() === "")
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }

    setIsFormComplete(true);
    toast.success("Form completed successfully!");
  };

  const handlePreviewSubmit = () => {
    toast.success("Form submitted successfully!");
    setShowPreview(false);
    setPreviewData({});
    setIsFormComplete(false);
  };

  const handleSaveForm = async () => {
    // Validate form name before saving
    const trimmedFormName = formName.trim();
    if (!trimmedFormName) {
      toast.error("Form name is required");
      return;
    }
    if (trimmedFormName.length < 3) {
      toast.error("Form name must be at least 3 characters");
      return;
    }
    if (trimmedFormName.length > 100) {
      toast.error("Form name cannot exceed 100 characters");
      return;
    }

    try {
      const formData = {
        formName: trimmedFormName,
        fields,
        metadata: {
          created: new Date().toISOString(),
          version: "1.0",
        },
      };

      const response = await fetch("http://localhost:5001/api/forms/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Form saved successfully:", result);
        toast.success("Form saved successfully!");
      } else {
        const errorData = await response.json();

        // Handle validation errors from backend
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error) => {
            toast.error(error.msg || error.message || "Validation error");
          });
        } else {
          toast.error(errorData.message || "Failed to save form");
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(`Error saving form: ${error.message}`);
    }
  };

  const handleExportForm = () => {
    const formData = {
      formName,
      fields,
      metadata: {
        created: new Date().toISOString(),
        version: "1.0",
      },
    };

    const blob = new Blob([JSON.stringify(formData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportForm = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const formData = JSON.parse(e.target.result);
        if (formData.fields && Array.isArray(formData.fields)) {
          setFields(formData.fields);
          setSelectedField(null);
        }
      } catch (error) {
        console.error("Error importing form:", error);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const sidebarWidth = 300;

  const renderSidebar = () => <FieldTypes onAddField={handleAddField} />;

  const renderToolbar = () => (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Form Name Section */}
      <Box
        sx={{
          p: isMobile ? 1.5 : 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setSidebarOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="bold"
              sx={{
                flexShrink: 0,
                cursor: "pointer",
                "&:hover": {
                  color: "primary.main",
                },
              }}
              onClick={handleEditFormName}
            >
              {formName}
            </Typography>
            <Tooltip title="Edit Form Name">
              <IconButton
                size="small"
                onClick={handleEditFormName}
                sx={{
                  ml: 0.5,
                  color: "text.secondary",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                <EditNoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: isMobile ? "wrap" : "nowrap",
              justifyContent: isMobile ? "center" : "flex-end",
              width: isMobile ? "100%" : "auto",
              mt: isMobile ? 1 : 0,
            }}
          >
            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              onClick={() => setShowPreview(!showPreview)}
              disabled={fields.length === 0}
            >
              {showPreview ? "Edit" : "Preview"}
            </Button>

            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              onClick={handleClearForm}
            >
              Clear
            </Button>

            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              id="import-form"
              onChange={handleImportForm}
            />

            <Button
              variant="contained"
              size={isMobile ? "small" : "medium"}
              onClick={handleSaveForm}
              disabled={
                fields.length === 0 ||
                !formName.trim() ||
                formName.trim().length < 3
              }
              color="primary"
            >
              Save
            </Button>

            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              onClick={handleExportForm}
              disabled={fields.length === 0}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Desktop Sidebar */}
        {!isMobile && renderSidebar()}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: sidebarWidth,
                boxSizing: "border-box",
              },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
              <IconButton onClick={() => setSidebarOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            {renderSidebar()}
          </Drawer>
        )}

        {/* Main Form Builder Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0, // Important for proper scrolling
          }}
        >
          {/* Toolbar */}
          {renderToolbar()}

          {/* Form Building Area */}
          <Box
            sx={{
              flex: 1,
              p: isMobile ? 1 : 2,
              overflow: "auto",
              position: "relative",
            }}
          >
            {showPreview ? (
              <FormPreview fields={fields} />
            ) : (
              <DroppableArea isEmpty={fields.length === 0}>
                {fields.length === 0 ? (
                  <>
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      color="text.secondary"
                      gutterBottom
                      textAlign="center"
                    >
                      Start Building Your Form
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      {isMobile
                        ? "Tap the menu button to add fields"
                        : "Drag field types from the left sidebar or click on them to add to your form"}
                    </Typography>
                  </>
                ) : (
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {fields.map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                        isSelected={selectedField?.id === field.id}
                        isMobile={isMobile}
                      />
                    ))}
                  </SortableContext>
                )}
              </DroppableArea>
            )}

            {/* Mobile FAB for adding fields */}
            {isMobile && !showPreview && (
              <Fab
                color="primary"
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 16,
                  zIndex: 1000,
                }}
                onClick={() => setSidebarOpen(true)}
              >
                <AddIcon />
              </Fab>
            )}
          </Box>
        </Box>

        {/* Field Configuration Panel */}
        {selectedField && !showPreview && (
          <FieldConfig
            field={selectedField}
            onUpdate={handleUpdateField}
            onClose={handleCloseConfig}
            allFields={fields}
            isMobile={isMobile}
          />
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <Paper
              sx={{ p: 2, opacity: 0.8, backgroundColor: "primary.light" }}
            >
              <Typography color="white">
                {activeId.startsWith("field-type-")
                  ? `Adding ${activeId.replace("field-type-", "")} field...`
                  : "Moving field..."}
              </Typography>
            </Paper>
          ) : null}
        </DragOverlay>

        {/* Form Name Dialog */}
        <Dialog
          open={showNameDialog}
          onClose={handleFormNameCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {formName === "Form Builder" ? "Enter Form Name" : "Edit Form Name"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Form Name"
              fullWidth
              variant="outlined"
              value={tempFormName}
              onChange={(e) => setTempFormName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleFormNameSubmit();
                }
              }}
              helperText="Form name must be between 3 and 100 characters"
              error={
                tempFormName.trim().length > 0 && tempFormName.trim().length < 3
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFormNameCancel}>Cancel</Button>
            <Button onClick={handleFormNameSubmit} variant="contained">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndContext>
  );
};

export default FormBuilder;
