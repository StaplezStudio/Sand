

import React, { useState } from 'react';
import { ChevronUpIcon } from './icons';
import { TopMenuBar } from './TopMenuBar';

interface ArdriveUploaderProps {
    className?: string;
    style?: React.CSSProperties;
}

export const ArdriveUploader: React.FC<ArdriveUploaderProps> = ({ className = '', style }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('https://app.ardrive.io/#/sign-in');
    
    const toggleDrawer = () => setIsOpen(!isOpen);

    const handleVisibleHeight = '2px';

    return (
        <div className={className} style={style}>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 animate-fade-in"
                    onClick={toggleDrawer}
                    aria-hidden="true"
                />
            )}

            <div
                className={`
                    fixed bottom-0 left-0 right-0 z-40
                    bg-gray-800
                    transition-transform duration-300 ease-in-out
                    h-[70vh] lg:h-[75vh]
                `}
                style={{
                    transform: isOpen ? 'translateY(0)' : `translateY(calc(100% - ${handleVisibleHeight}))`,
                }}
            >
                <div className="w-full h-[2px] bg-indigo-500 absolute top-0"></div>
                
                <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                >
                    <button
                        onClick={toggleDrawer}
                        className="w-28 h-14 bg-gray-800 rounded-t-full border-t-2 border-l-2 border-r-2 border-indigo-500 flex items-center justify-center pt-2 text-white hover:bg-indigo-700 hover:border-indigo-400 transition-all focus:outline-none"
                        aria-label={isOpen ? "Close Drawer" : "Open Drawer"}
                        aria-expanded={isOpen}
                    >
                         <ChevronUpIcon className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="w-full h-full flex flex-col pt-2">
                    <TopMenuBar onUrlChange={(url) => {
                        setCurrentUrl(url);
                        if (!isOpen) setIsOpen(true);
                    }} />
                    <iframe
                        key={currentUrl}
                        src={currentUrl}
                        title="Web Content Viewer"
                        className="w-full h-full border-0 flex-grow"
                        style={{
                           opacity: isOpen ? 1 : 0,
                           pointerEvents: isOpen ? 'auto' : 'none',
                           transition: 'opacity 0.2s linear'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
