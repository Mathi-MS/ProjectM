import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { FIELD_TYPES, GRID_SIZES } from "./constants";

const FieldConfig = ({ field, onUpdate, onClose, allFields }) => {
  const [config, setConfig] = useState(field);

  useEffect(() => {
    setConfig(field);
  }, [field]);

  const handleChange = (key, value) => {
    const updatedConfig = { ...config, [key]: value };
    setConfig(updatedConfig);
    onUpdate(updatedConfig);
  };

  const handleValidationChange = (key, value) => {
    const validations = { ...config.validations, [key]: value };
    handleChange("validations", validations);
  };

  const handleOptionChange = (index, key, value) => {
    const options = [...(config.options || [])];
    options[index] = { ...options[index], [key]: value };
    handleChange("options", options);
  };

  const addOption = () => {
    const options = [...(config.options || [])];
    options.push({
      label: `Option ${options.length + 1}`,
      value: `option${options.length + 1}`,
    });
    handleChange("options", options);
  };

  const removeOption = (index) => {
    const options = [...(config.options || [])];
    options.splice(index, 1);
    handleChange("options", options);
  };

  const handleDependencyChange = (key, value) => {
    const dependsOn = { ...config.dependsOn, [key]: value };
    handleChange("dependsOn", dependsOn);
  };

  const removeDependency = () => {
    const { dependsOn, ...rest } = config;
    setConfig(rest);
    onUpdate(rest);
  };

  const renderBasicSettings = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Basic Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Field Name"
              value={config.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>

          {config.type !== FIELD_TYPES.HIDDEN && (
            <Grid item xs={12}>
              <TextField
                label="Label"
                value={config.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          )}

          {(config.type === FIELD_TYPES.TEXT ||
            config.type === FIELD_TYPES.EMAIL ||
            config.type === FIELD_TYPES.NUMBER ||
            config.type === FIELD_TYPES.PASSWORD ||
            config.type === FIELD_TYPES.URL ||
            config.type === FIELD_TYPES.TEL ||
            config.type === FIELD_TYPES.TEXTAREA) && (
            <Grid item xs={12}>
              <TextField
                label="Placeholder"
                value={config.placeholder || ""}
                onChange={(e) => handleChange("placeholder", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          )}

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Grid Size</InputLabel>
              <Select
                value={config.gridSize || 6}
                onChange={(e) => handleChange("gridSize", e.target.value)}
                label="Grid Size"
              >
                {GRID_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}/12
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.required || false}
                  onChange={(e) => handleChange("required", e.target.checked)}
                />
              }
              label="Required"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Helper Text"
              value={config.helperText || ""}
              onChange={(e) => handleChange("helperText", e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderValidationSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Validation</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {(config.type === FIELD_TYPES.TEXT ||
            config.type === FIELD_TYPES.TEXTAREA ||
            config.type === FIELD_TYPES.PASSWORD) && (
            <>
              <Grid item xs={6}>
                <TextField
                  label="Min Length"
                  type="number"
                  value={config.validations?.minLength || ""}
                  onChange={(e) =>
                    handleValidationChange(
                      "minLength",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Length"
                  type="number"
                  value={config.validations?.maxLength || ""}
                  onChange={(e) =>
                    handleValidationChange(
                      "maxLength",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
            </>
          )}

          {config.type === FIELD_TYPES.NUMBER && (
            <>
              <Grid item xs={6}>
                <TextField
                  label="Min Value"
                  type="number"
                  value={config.validations?.min || ""}
                  onChange={(e) =>
                    handleValidationChange(
                      "min",
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Value"
                  type="number"
                  value={config.validations?.max || ""}
                  onChange={(e) =>
                    handleValidationChange(
                      "max",
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              label="Pattern (RegEx)"
              value={config.validations?.pattern || ""}
              onChange={(e) =>
                handleValidationChange("pattern", e.target.value)
              }
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Pattern Error Message"
              value={config.validations?.patternMessage || ""}
              onChange={(e) =>
                handleValidationChange("patternMessage", e.target.value)
              }
              fullWidth
              size="small"
            />
          </Grid>

          {config.type === FIELD_TYPES.FILE && (
            <>
              <Grid item xs={12}>
                <TextField
                  label="Allowed File Types (comma separated)"
                  value={config.validations?.fileType?.join(", ") || ""}
                  onChange={(e) => {
                    const types = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t);
                    handleValidationChange("fileType", types);
                  }}
                  fullWidth
                  size="small"
                  placeholder="image/png, image/jpeg, application/pdf"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max File Size (MB)"
                  type="number"
                  value={config.validations?.fileSize || ""}
                  onChange={(e) =>
                    handleValidationChange(
                      "fileSize",
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.multiple || false}
                      onChange={(e) =>
                        handleChange("multiple", e.target.checked)
                      }
                    />
                  }
                  label="Multiple Files"
                />
              </Grid>
            </>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderOptionsSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Options</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          {config.options?.map((option, index) => (
            <Box
              key={index}
              sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}
            >
              <TextField
                label="Label"
                value={option.label}
                onChange={(e) =>
                  handleOptionChange(index, "label", e.target.value)
                }
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Value"
                value={option.value}
                onChange={(e) =>
                  handleOptionChange(index, "value", e.target.value)
                }
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton onClick={() => removeOption(index)} size="small">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addOption}
            variant="outlined"
            size="small"
          >
            Add Option
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderDependencySettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Field Dependencies</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Depends On Field</InputLabel>
              <Select
                value={config.dependsOn?.field || ""}
                onChange={(e) =>
                  handleDependencyChange("field", e.target.value)
                }
                label="Depends On Field"
              >
                {allFields
                  .filter(
                    (f) =>
                      f.id !== config.id &&
                      f.type !== FIELD_TYPES.HEADER &&
                      f.type !== FIELD_TYPES.PARAGRAPH
                  )
                  .map((f) => (
                    <MenuItem key={f.id} value={f.name}>
                      {f.label || f.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {config.dependsOn?.field && (
            <>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={config.dependsOn?.condition || "equals"}
                    onChange={(e) =>
                      handleDependencyChange("condition", e.target.value)
                    }
                    label="Condition"
                  >
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="not_equals">Not Equals</MenuItem>
                    <MenuItem value="contains">Contains</MenuItem>
                    <MenuItem value="not_empty">Not Empty</MenuItem>
                    <MenuItem value="empty">Empty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Value"
                  value={config.dependsOn?.value || ""}
                  onChange={(e) =>
                    handleDependencyChange("value", e.target.value)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  onClick={removeDependency}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  Remove Dependency
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderSpecialSettings = () => {
    if (config.type === FIELD_TYPES.HEADER) {
      return (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Header Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Header Text"
                  value={config.text || ""}
                  onChange={(e) => handleChange("text", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Variant</InputLabel>
                  <Select
                    value={config.variant || "h4"}
                    onChange={(e) => handleChange("variant", e.target.value)}
                    label="Variant"
                  >
                    <MenuItem value="h1">H1</MenuItem>
                    <MenuItem value="h2">H2</MenuItem>
                    <MenuItem value="h3">H3</MenuItem>
                    <MenuItem value="h4">H4</MenuItem>
                    <MenuItem value="h5">H5</MenuItem>
                    <MenuItem value="h6">H6</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Alignment</InputLabel>
                  <Select
                    value={config.align || "left"}
                    onChange={(e) => handleChange("align", e.target.value)}
                    label="Alignment"
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      );
    }

    if (config.type === FIELD_TYPES.PARAGRAPH) {
      return (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Paragraph Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Paragraph Text"
                  value={config.text || ""}
                  onChange={(e) => handleChange("text", e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Alignment</InputLabel>
                  <Select
                    value={config.align || "left"}
                    onChange={(e) => handleChange("align", e.target.value)}
                    label="Alignment"
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="justify">Justify</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      );
    }

    if (config.type === FIELD_TYPES.RATING) {
      return (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Rating Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Max Rating"
                  type="number"
                  value={config.max || 5}
                  onChange={(e) =>
                    handleChange("max", parseInt(e.target.value) || 5)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Precision"
                  type="number"
                  value={config.precision || 1}
                  onChange={(e) =>
                    handleChange("precision", parseFloat(e.target.value) || 1)
                  }
                  fullWidth
                  size="small"
                  inputProps={{ step: 0.1, min: 0.1, max: 1 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        width: 350,
        p: 2,
        borderLeft: 1,
        borderColor: "divider",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Field Configuration</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Chip label={config.type} color="primary" size="small" sx={{ mb: 2 }} />

      {renderBasicSettings()}
      {renderValidationSettings()}

      {(config.type === FIELD_TYPES.SELECT ||
        config.type === FIELD_TYPES.MULTISELECT ||
        config.type === FIELD_TYPES.RADIO) &&
        renderOptionsSettings()}

      {renderDependencySettings()}
      {renderSpecialSettings()}
    </Box>
  );
};

export default FieldConfig;
