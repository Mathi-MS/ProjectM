import React from "react";
import { Grid } from "@mui/material";
import { FIELD_TYPES, RESPONSIVE_GRID_CONFIG } from "./constants";
import { checkFieldDependency } from "./utils";
import {
  TextInput,
  NumberInput,
  EmailInput,
  DateInput,
  TimeInput,
  WeekInput,
  ColorInput,
  PasswordInput,
  UrlInput,
  TelInput,
  TextareaInput,
  SelectInput,
  MultiSelectInput,
  CheckboxInput,
  RadioInput,
  SwitchInput,
  FileInput,
  RatingInput,
  HeaderElement,
  ParagraphElement,
  DividerElement,
  SpacerElement,
  HiddenInput,
  StepElement,
} from "./FormFields";

const FormRenderer = ({ fields, control, errors, watch, disabled = false }) => {
  const watchedValues = watch ? watch() : {};

  const renderField = (field) => {
    // Check field dependency
    if (!checkFieldDependency(field, watchedValues)) {
      return null;
    }

    const commonProps = {
      field,
      control,
      errors,
      disabled,
    };

    switch (field.type) {
      case FIELD_TYPES.TEXT:
        return <TextInput {...commonProps} />;
      case FIELD_TYPES.NUMBER:
        return <NumberInput {...commonProps} />;
      case FIELD_TYPES.EMAIL:
        return <EmailInput {...commonProps} />;
      case FIELD_TYPES.DATE:
        return <DateInput {...commonProps} />;
      case FIELD_TYPES.TIME:
        return <TimeInput {...commonProps} />;
      case FIELD_TYPES.WEEK:
        return <WeekInput {...commonProps} />;
      case FIELD_TYPES.COLOR:
        return <ColorInput {...commonProps} />;
      case FIELD_TYPES.PASSWORD:
        return <PasswordInput {...commonProps} />;
      case FIELD_TYPES.URL:
        return <UrlInput {...commonProps} />;
      case FIELD_TYPES.TEL:
        return <TelInput {...commonProps} />;
      case FIELD_TYPES.TEXTAREA:
        return <TextareaInput {...commonProps} />;
      case FIELD_TYPES.SELECT:
        return <SelectInput {...commonProps} />;
      case FIELD_TYPES.MULTISELECT:
        return <MultiSelectInput {...commonProps} />;
      case FIELD_TYPES.CHECKBOX:
        return <CheckboxInput {...commonProps} />;
      case FIELD_TYPES.RADIO:
        return <RadioInput {...commonProps} />;
      case FIELD_TYPES.SWITCH:
        return <SwitchInput {...commonProps} />;
      case FIELD_TYPES.FILE:
        return <FileInput {...commonProps} />;
      case FIELD_TYPES.RATING:
        return <RatingInput {...commonProps} />;
      case FIELD_TYPES.HEADER:
        return <HeaderElement field={field} />;
      case FIELD_TYPES.PARAGRAPH:
        return <ParagraphElement field={field} />;
      case FIELD_TYPES.DIVIDER:
        return <DividerElement field={field} />;
      case FIELD_TYPES.SPACER:
        return <SpacerElement field={field} />;
      case FIELD_TYPES.HIDDEN:
        return <HiddenInput {...commonProps} />;
      case FIELD_TYPES.STEP:
        return <StepElement field={field} />;
      default:
        return null;
    }
  };

  const getResponsiveGridSize = (gridSize) => {
    const size = gridSize || 6;
    return {
      xs: RESPONSIVE_GRID_CONFIG.xs[size] || 12,
      sm: RESPONSIVE_GRID_CONFIG.sm[size] || 6,
      md: RESPONSIVE_GRID_CONFIG.md[size] || size,
      lg: size,
      xl: size,
    };
  };

  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        const renderedField = renderField(field);
        if (!renderedField) return null;

        const responsiveGrid = getResponsiveGridSize(field.gridSize);

        return (
          <Grid
            item
            xs={responsiveGrid.xs}
            sm={responsiveGrid.sm}
            md={responsiveGrid.md}
            lg={responsiveGrid.lg}
            xl={responsiveGrid.xl}
            key={field.id}
          >
            {renderedField}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FormRenderer;
