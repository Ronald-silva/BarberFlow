import React from 'react';
import styled from 'styled-components';
import { Input, Label, FormGroup, HelperText, ErrorText } from './Input';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  $variant?: 'default' | 'filled' | 'outlined';
  $size?: 'sm' | 'md' | 'lg';
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  error,
  required,
  $variant,
  $size,
  id,
  ...inputProps
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormGroup>
      {label && (
        <Label htmlFor={inputId} $required={required} $error={!!error}>
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        $variant={$variant}
        $size={$size}
        $error={!!error}
        {...inputProps}
      />
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </FormGroup>
  );
};

export default InputField;