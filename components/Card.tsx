
import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  step: number;
  children: ReactNode;
  statusIcon?: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, step, children, statusIcon }) => (
  <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
      <h2 className="text-lg font-semibold flex items-center">
        <span className="text-xs w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-indigo-500 text-white font-bold">{step}</span>
        {title}
      </h2>
      {statusIcon}
    </div>
    <div className="p-6 flex-grow">
      {children}
    </div>
  </div>
);

export default Card;
