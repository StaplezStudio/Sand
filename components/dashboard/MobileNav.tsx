
import React from 'react';
import type { MobileView } from '../../types';

interface MobileNavProps {
    activeView: MobileView;
    setView: (view: MobileView) => void;
}

const navItems: { id: MobileView; label: string }[] = [
    { id: 'tree', label: 'Tree' },
    { id: 'parentNft', label: 'NFT Minter' },
    { id: 'cnft', label: 'cNFT Minter' },
    { id: 'history', label: 'History' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setView }) => {
    return (
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 p-2 sticky top-4 z-10">
            <div className="flex items-center justify-around space-x-1">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`
                            px-2 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 w-full text-center truncate
                            ${activeView === item.id 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-300 hover:bg-gray-700/50'}
                        `}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};