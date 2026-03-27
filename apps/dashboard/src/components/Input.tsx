import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg font-size text-gray-900 bg-white
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-violet-500'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
