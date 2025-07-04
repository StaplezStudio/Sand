import React from 'react';
import { useAppContext } from '../../App';
import { shortenAddress } from '../../lib/utils';
import type { MintedNft } from '../../types';

export const MintHistory: React.FC = () => {
    const { state, handleSaveDatabase, handleSelectHistoryItem } = useAppContext();
    const { mintHistory } = state;

    const renderItemName = (item: MintedNft) => {
        const isClickable = (item.type === 'Merkle Tree' && item.address) ||
                            ((item.type === 'Parent NFT' || item.type === 'NFT') && item.address) ||
                            (item.type === 'cNFT' && item.metadataUrl);

        const nameComponent = isClickable ? (
            <button
                onClick={() => handleSelectHistoryItem(item)}
                className="font-medium text-white hover:text-indigo-300 hover:underline transition-colors text-left"
                title={`Click to use this ${item.type}`}
            >
                {item.name}
            </button>
        ) : (
             <span className="font-medium text-white">{item.name}</span>
        );
        
        return (
            <div className="flex items-center space-x-2">
                {nameComponent}
                {item.type === 'cNFT' && item.collectionAddress && (
                     <div 
                        className="px-2 py-0.5 text-xs font-semibold bg-purple-900 text-purple-300 rounded-full"
                        title={`In Collection: ${item.collectionAddress}`}
                    >
                        In Collection
                    </div>
                )}
            </div>
        )
    };
    
    const renderItemType = (item: MintedNft) => {
        const isClickable = (item.type === 'Merkle Tree' && item.address) ||
                            ((item.type === 'Parent NFT' || item.type === 'NFT') && item.address) ||
                            (item.type === 'cNFT' && item.metadataUrl);
        
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        const typeColors: {[key: string]: string} = {
            'cNFT': 'bg-pink-900 text-pink-300',
            'Parent NFT': 'bg-purple-900 text-purple-300',
            'NFT': 'bg-blue-900 text-blue-300',
            'Merkle Tree': 'bg-teal-900 text-teal-300',
        };
        const hoverColors: {[key: string]: string} = {
            'Parent NFT': 'hover:bg-purple-800',
            'NFT': 'hover:bg-blue-800',
            'Merkle Tree': 'hover:bg-teal-800',
            'cNFT': 'hover:bg-pink-800',
        };

        const className = `${baseClasses} ${typeColors[item.type] || 'bg-gray-900 text-gray-300'}`;

        if (isClickable) {
            return (
                <button
                    onClick={() => handleSelectHistoryItem(item)}
                    title={`Click to use this ${item.type}`}
                    className={`${className} ${hoverColors[item.type] || ''} transition-colors`}
                >
                    {item.type}
                </button>
            );
        }
        
        return <span className={className}>{item.type}</span>;
    };


    return (
        <div className="mt-8 bg-gray-800/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                    Mint Activity
                </h2>
                <button
                    onClick={handleSaveDatabase}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-300 text-sm"
                >
                    Save Database
                </button>
            </div>

            {mintHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    Your minting activity will appear here.
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mintHistory.map(item => (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            {renderItemType(item)}
                          </td>
                          <td className="px-6 py-4">
                            {renderItemName(item)}
                          </td>
                          <td className="px-6 py-4">
                            <a 
                              href={`https://explorer.solana.com/tx/${item.transactionId}${item.cluster === 'custom' ? '' : `?cluster=${item.cluster}`}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-400 hover:text-indigo-300 hover:underline"
                            >
                              {shortenAddress(item.transactionId, 8)}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
        </div>
    );
};