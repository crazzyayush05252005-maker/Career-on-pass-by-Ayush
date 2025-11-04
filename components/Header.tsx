
import React from 'react';

interface HeaderProps {
    onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
    return (
        <header className="p-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700">
            <div className="container mx-auto flex items-center justify-between">
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={onHomeClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4m0 16v- контекст4m0-12V4m0 12h6m-6 0l6-3m-6 0l6 3m-6-12l6-3m0 0l6 3m-6-3v12m6-12v12m0 0l5.447 2.724A1 1 0 0021 16.382V7.618a1 1 0 00-.553-.894L15 4" />
                    </svg>
                    <h1 className="text-2xl font-bold text-white">Career Compass</h1>
                </div>
            </div>
        </header>
    );
};
