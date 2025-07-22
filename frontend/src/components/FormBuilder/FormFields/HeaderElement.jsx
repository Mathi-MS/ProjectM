import React from 'react';
import { Typography } from '@mui/material';

const HeaderElement = ({ field }) => {
  return (
    <Typography
      variant={field.variant || 'h4'}
      align={field.align || 'left'}
      gutterBottom
      sx={{
        fontWeight: field.fontWeight || 'bold',
        color: field.color || 'inherit',
        mb: field.marginBottom || 2
      }}
    >
      {field.text || 'Header Text'}
    </Typography>
  );
};

export default HeaderElement;