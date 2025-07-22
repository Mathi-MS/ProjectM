import React from 'react';
import { Grid } from '@mui/material';
import { FIELD_TYPES } from './constants';
import { checkFieldDependency } from './utils';
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
  HiddenInput
} from './FormFields';

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
      disabled
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
      case FIELD_TYPES.HIDDEN:
        return <HiddenInput {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        const renderedField = renderField(field);
        if (!renderedField) return null;

        return (
          <Grid 
            item 
            xs={12} 
            sm={field.gridSize === 12 ? 12 : field.gridSize || 6}
            md={field.gridSize || 6}
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