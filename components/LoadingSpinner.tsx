
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Consulting the AI Career Advisor...' }) => {
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="text-white text-lg mt-4">{message}</p>
        </div>
    );
};
