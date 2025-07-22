import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Alert,
} from "@mui/material";
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

const SortableFieldItem = ({ field, onEdit, onDelete, isSelected }) => {
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
        p: 2,
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
          size="small"
          {...attributes}
          {...listeners}
          sx={{ cursor: "grab" }}
        >
          <DragIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {getFieldDisplayName(field)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {field.type} • Grid: {field.gridSize}/12
            {field.required && " • Required"}
          </Typography>
        </Box>

        <Tooltip title="Edit Field">
          <IconButton size="small" onClick={() => onEdit(field)}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Field">
          <IconButton
            size="small"
            onClick={() => onDelete(field.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeId, setActiveId] = useState(null);

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

  const handleAddField = useCallback((fieldType) => {
    const newField = createField(fieldType);
    setFields((prev) => [...prev, newField]);
    setSelectedField(newField);
  }, []);

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
        setFields((prev) => [...prev, newField]);
        setSelectedField(newField);
        return;
      }

      // Find insertion index based on drop position
      const overIndex = fields.findIndex((f) => f.id === over.id);
      const insertIndex = overIndex >= 0 ? overIndex + 1 : fields.length;

      const newFields = [...fields];
      newFields.splice(insertIndex, 0, newField);
      setFields(newFields);
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

  const handleClearForm = () => {
    setFields([]);
    setSelectedField(null);
  };

  const handleExportForm = () => {
    const formData = {
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
    a.download = "form-config.json";
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Field Types Sidebar */}
        <FieldTypes onAddField={handleAddField} />

        {/* Main Form Builder Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Toolbar */}
          <Paper sx={{ p: 2, borderRadius: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Form Builder
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit Mode" : "Preview"}
                </Button>

                <Button variant="outlined" onClick={handleClearForm}>
                  Clear All
                </Button>

                <input
                  type="file"
                  accept=".json"
                  style={{ display: "none" }}
                  id="import-form"
                  onChange={handleImportForm}
                />
                <label htmlFor="import-form">
                  <Button variant="outlined" component="span">
                    Import
                  </Button>
                </label>

                <Button
                  variant="contained"
                  onClick={handleExportForm}
                  disabled={fields.length === 0}
                >
                  Export
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Form Building Area */}
          <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
            {showPreview ? (
              <FormPreview fields={fields} />
            ) : (
              <DroppableArea isEmpty={fields.length === 0}>
                {fields.length === 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      Start Building Your Form
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag field types from the left sidebar or click on them to
                      add to your form
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
                      />
                    ))}
                  </SortableContext>
                )}
              </DroppableArea>
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
      </Box>
    </DndContext>
  );
};

export default FormBuilder;
