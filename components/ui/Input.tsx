import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold font-heading">
          {label}
        </label>
      )}
      <input 
        className={`
          bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 
          placeholder-gray-400 focus:border-madrasah-primary focus:ring-2 focus:ring-madrasah-primary/20 
          transition-all duration-300 outline-none shadow-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
};