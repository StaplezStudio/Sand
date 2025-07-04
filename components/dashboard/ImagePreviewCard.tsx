
import React from 'react';
import { Spinner, ClipboardIcon } from '../icons';

interface ImagePreviewCardProps {
    title: string;
    imageUrl: string;
    loading?: boolean;
    nftType?: 'Regular' | 'Collection' | 'Standalone';
    collectionAddress?: string;
    onCopy?: (text: string) => void;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({ title, imageUrl, loading, nftType, collectionAddress, onCopy }) => {
    const [imageError, setImageError] = React.useState(false);

    // Reset error state when imageUrl changes
    React.useEffect(() => {
        setImageError(false);
    }, [imageUrl]);

    return (
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <div className="p-6 h-64 flex items-center justify-center bg-gray-900/30">
                {loading ? (
                    <Spinner className="h-10 w-10 text-gray-400" />
                ) : imageError ? (
                    <div className="text-center text-red-400">
                        Could not load image.
                    </div>
                ) : imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
                        onError={() => setImageError(true)}
                    />
                ) : (
                     <div className="text-center text-gray-500">
                        Image preview will appear here.
                    </div>
                )}
            </div>
             {(nftType || (nftType === 'Collection' && collectionAddress)) && imageUrl && !imageError && (
                <div className="p-3 border-t border-gray-700 bg-gray-800 text-center space-y-3">
                    {nftType &&
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">TYPE: </span>
                            <span className="font-medium text-gray-200">{nftType}</span>
                        </div>
                    }
                    {nftType === 'Collection' && collectionAddress && onCopy && (
                        <div>
                             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">COLLECTION NFT ADDRESS:</span>
                             <div className="mt-1 flex items-center justify-center max-w-xs mx-auto space-x-2 bg-gray-900/50 p-1.5 rounded-lg">
                                <span className="font-mono text-gray-300 break-all">{collectionAddress}</span>
                                <button
                                    onClick={() => onCopy(collectionAddress)}
                                    className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                                    title="Copy Address"
                                >
                                    <ClipboardIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};