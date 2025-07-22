import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  FormHelperText,
  Paper
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { validateFile, formatFileSize } from '../utils';

const FileInput = ({ field, control, errors, disabled = false }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e, onChange) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files, onChange);
  };

  const handleFileSelection = (files, onChange) => {
    const validFiles = [];
    const fileErrors = [];

    files.forEach(file => {
      const errors = validateFile(file, field.validations || {});
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        fileErrors.push({ file: file.name, errors });
      }
    });

    if (field.multiple) {
      onChange(validFiles);
    } else {
      onChange(validFiles[0] || null);
    }

    // Handle file errors (you might want to show these to the user)
    if (fileErrors.length > 0) {
      console.warn('File validation errors:', fileErrors);
    }
  };

  const removeFile = (index, files, onChange) => {
    if (field.multiple) {
      const newFiles = files.filter((_, i) => i !== index);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  return (
    <Controller
      name={field.name}
      control={control}
      rules={{
        required: field.required ? `${field.label} is required` : false
      }}
      render={({ field: controllerField }) => (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {field.label}
          </Typography>
          
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: dragOver ? 'action.hover' : 'background.paper',
              border: dragOver ? '2px dashed primary.main' : '2px dashed grey.300',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, controllerField.onChange)}
          >
            <input
              type="file"
              multiple={field.multiple}
              accept={field.validations?.fileType?.join(',')}
              style={{ display: 'none' }}
              id={`file-input-${field.name}`}
              disabled={disabled}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                handleFileSelection(files, controllerField.onChange);
              }}
            />
            
            <label htmlFor={`file-input-${field.name}`}>
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop files here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {field.validations?.fileType && (
                  <>Accepted types: {field.validations.fileType.join(', ')}<br /></>
                )}
                {field.validations?.fileSize && (
                  <>Max size: {field.validations.fileSize}MB<br /></>
                )}
                {field.multiple ? 'Multiple files allowed' : 'Single file only'}
              </Typography>
            </label>
          </Paper>

          {/* Display selected files */}
          {controllerField.value && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files:
              </Typography>
              <List dense>
                {field.multiple ? (
                  controllerField.value.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeFile(index, controllerField.value, controllerField.onChange)}
                          disabled={disabled}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={controllerField.value.name}
                      secondary={formatFileSize(controllerField.value.size)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeFile(0, controllerField.value, controllerField.onChange)}
                        disabled={disabled}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          {(errors[field.name]?.message || field.helperText) && (
            <FormHelperText error={!!errors[field.name]}>
              {errors[field.name]?.message || field.helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

export default FileInput;