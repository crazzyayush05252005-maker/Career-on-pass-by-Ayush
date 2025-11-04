
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, onClick, badge }) => {
  const badgeColor = badge === 'High' ? 'bg-green-500/20 text-green-300' 
                     : badge === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' 
                     : badge === 'Low' ? 'bg-red-500/20 text-red-300'
                     : 'bg-indigo-500/20 text-indigo-300';

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/50 rounded-lg p-6 shadow-lg hover:shadow-indigo-500/50 hover:bg-slate-800 transition-all duration-300 cursor-pointer border border-slate-700 hover:border-indigo-500"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {badge && (
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-400">{description}</p>
    </div>
  );
};
