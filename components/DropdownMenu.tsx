import React, { useState, useEffect, useRef } from 'react';

export interface DropdownItemDef {
  name: string;
  url?: string;
  external?: boolean;
  isHeader?: boolean;
}

interface DropdownMenuProps {
  title: string;
  items: DropdownItemDef[];
  onItemClick: (url: string) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 focus:bg-gray-700 rounded-md focus:outline-none transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {title}
      </button>
      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-56 origin-top-left bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-fade-in"
          style={{animationDuration: '150ms'}}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {items.map((item, index) => {
              if (item.isHeader) {
                return (
                  <div key={`${item.name}-${index}`} className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {item.name}
                  </div>
                );
              }
              
              return (
                <button
                  key={`${item.name}-${index}`}
                  onClick={() => {
                      if (item.url) {
                          if (item.external) {
                              window.open(item.url, '_blank', 'noopener,noreferrer');
                          } else {
                              onItemClick(item.url);
                          }
                      }
                      setIsOpen(false);
                  }}
                  disabled={!item.url}
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left disabled:text-gray-500 disabled:cursor-not-allowed"
                  role="menuitem"
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
