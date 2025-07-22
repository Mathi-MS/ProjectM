import React from 'react';
import { Controller } from 'react-hook-form';

const HiddenInput = ({ field, control }) => {
  return (
    <Controller
      name={field.name}
      control={control}
      defaultValue={field.value || ''}
      render={({ field: controllerField }) => (
        <input
          {...controllerField}
          type="hidden"
        />
      )}
    />
  );
};

export default HiddenInput;