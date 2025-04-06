import React from 'react';

const LoginInput = ({
  type = 'text',
  name = '',
  label = '',
  value = '',
  placeholder = '',
  required = false,  
  canAutoComplete = false,
  onChange
}) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="block text-md font-medium mb-2">{label}</label>}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={canAutoComplete ? 'on' : 'off'}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-700"
      />
    </div>
  );
};

export default LoginInput;
