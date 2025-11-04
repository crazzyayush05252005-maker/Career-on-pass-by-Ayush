
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  const variantClasses = variant === 'primary' 
    ? "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500"
    : "bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500";

  return (
    <button className={`${baseClasses} ${variantClasses}`} {...props}>
      {children}
    </button>
  );
};
