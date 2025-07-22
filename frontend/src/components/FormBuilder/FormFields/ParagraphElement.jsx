import React from 'react';
import { Typography } from '@mui/material';

const ParagraphElement = ({ field }) => {
  return (
    <Typography
      variant="body1"
      align={field.align || 'left'}
      paragraph
      sx={{
        color: field.color || 'inherit',
        fontSize: field.fontSize || 'inherit',
        mb: field.marginBottom || 2
      }}
    >
      {field.text || 'Paragraph text goes here'}
    </Typography>
  );
};

export default ParagraphElement;