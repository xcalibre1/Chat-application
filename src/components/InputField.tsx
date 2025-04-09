// components/InputField.tsx
import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, placeholder, error }) => {
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}:</label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default InputField;
