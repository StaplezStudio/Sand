import React from 'react';
import { ClipboardIcon, XCircleIcon } from './icons';

interface MetadataViewerProps {
    json: string;
    onClose: () => void;
    onCopy: () => void;
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ json, onClose, onCopy }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end z-40 animate-fade-in" onClick={onClose}>
            <div 
                className="relative w-full max-w-4xl max-h-[70vh] bg-gray-800 rounded-t-2xl border-t-4 border-red-500 top-shadow flex flex-col animate-slide-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-red-400">Generated Metadata JSON</h3>
                    <div className="flex items-center space-x-4">
                        <button onClick={onCopy} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors" title="Copy JSON">
                            <ClipboardIcon className="h-5 w-5" />
                            <span>Copy</span>
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" title="Close Viewer">
                           <XCircleIcon className="h-7 w-7" />
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto p-4">
                    <pre className="text-sm text-gray-200 bg-gray-900/70 p-4 rounded-lg whitespace-pre-wrap break-all">
                        <code>
                            {json}
                        </code>
                    </pre>
                </div>
                 <div className="text-center p-3 border-t border-gray-700 text-xs text-gray-500 flex-shrink-0">
                    Upload this JSON content to a permanent storage service like Arweave or IPFS to get your metadata URL.
                </div>
            </div>
        </div>
    );
};

export default MetadataViewer;