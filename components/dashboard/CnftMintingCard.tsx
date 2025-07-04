import React from 'react';
import { useAppContext } from '../../App';
import Card from '../Card';
import { Spinner } from '../icons';

export const CnftMintingCard: React.FC = () => {
    const { state, dispatch, handleMintCnft, handleFetchCnftMetadata } = useAppContext();
    const { cnft, rpc } = state;

    const isFormDisabled = !rpc.verified || cnft.loading || !cnft.treeAddress;
    const isFetchDisabled = isFormDisabled || !cnft.metadataUrl || cnft.fetchingMetadata;
    
    const getButtonText = () => {
        if (cnft.loading) return 'Minting cNFT...';
        return 'Mint cNFT';
    };

    return (
        <Card title="cNFT Minting" step={4}>
            <div className="space-y-4">
              <div>
                <label htmlFor="treeAddress" className="block text-sm font-medium text-gray-300 mb-1">Merkle Tree Address</label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        id="treeAddress" 
                        placeholder="Create a tree or paste address" 
                        value={cnft.treeAddress} 
                        onChange={e => dispatch({type: 'SET_CNFT_FORM', payload: {field: 'treeAddress', value: e.target.value}})} 
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" 
                        disabled={!rpc.verified || cnft.loading} 
                    />
                </div>
              </div>

              <fieldset disabled={isFormDisabled} className="space-y-4">
                  <div className={`transition-opacity duration-300 ${isFormDisabled ? 'opacity-50' : 'opacity-100'}`}>
                    {/* Minting is now only possible from an existing Metadata URL */}
                    <div className="space-y-4">
                      <label htmlFor="cnft-uri" className="block text-sm font-medium text-gray-300 mb-1">Metadata URL</label>
                      <div className="flex space-x-2">
                        <input type="text" id="cnft-uri" placeholder="https://arweave.net/..." value={cnft.metadataUrl} onChange={e => dispatch({type: 'SET_CNFT_FORM', payload: {field: 'metadataUrl', value: e.target.value}})} className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        <button onClick={() => handleFetchCnftMetadata(cnft.metadataUrl)} disabled={isFetchDisabled} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex items-center">
                            {cnft.fetchingMetadata ? <Spinner className="h-5 w-5"/> : 'Preview'}
                        </button>
                      </div>
                      <div className="mt-4 space-y-4 border border-gray-700 border-dashed p-3 rounded-lg">
                          <div>
                              <label htmlFor="cnft-name-preview" className="block text-sm font-medium text-gray-400 mb-1">Name (from metadata)</label>
                              <input type="text" id="cnft-name-preview" value={cnft.name} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-300 cursor-not-allowed" disabled />
                          </div>
                          <div>
                              <label htmlFor="cnft-symbol-preview" className="block text-sm font-medium text-gray-400 mb-1">Symbol (from metadata)</label>
                              <input type="text" id="cnft-symbol-preview" value={cnft.symbol} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-300 cursor-not-allowed" disabled />
                          </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                        <input id="mintToCollection" type="checkbox" checked={cnft.mintToCollection} onChange={e => dispatch({type: 'SET_CNFT_FORM', payload: {field: 'mintToCollection', value: e.target.checked}})} className="h-4 w-4 text-pink-600 bg-gray-700 border-gray-600 rounded focus:ring-pink-500" />
                        <label htmlFor="mintToCollection" className="ml-2 block text-sm text-gray-300">Mint to Collection</label>
                    </div>

                    {cnft.mintToCollection && (
                      <div>
                        <label htmlFor="collectionAddress" className="block text-sm font-medium text-gray-300 mb-1">Collection NFT Address</label>
                        <input type="text" id="collectionAddress" placeholder="Mint a parent NFT or paste address" value={cnft.collectionAddress} onChange={e => dispatch({type: 'SET_CNFT_FORM', payload: {field: 'collectionAddress', value: e.target.value}})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                      </div>
                    )}

                    <div className="space-y-3 rounded-lg border border-gray-700 p-3">
                        <div className="flex items-center">
                            <input
                                id="cnft-airdrop-checkbox"
                                type="checkbox"
                                checked={cnft.mintToDifferentWallet}
                                onChange={e => dispatch({type: 'SET_CNFT_FORM', payload: {field: 'mintToDifferentWallet', value: e.target.checked}})}
                                className="h-4 w-4 text-pink-600 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                            />
                            <label htmlFor="cnft-airdrop-checkbox" className="ml-2 block text-sm text-gray-300">
                                Airdrop to another wallet
                            </label>
                        </div>
                        {cnft.mintToDifferentWallet && (
                            <div className="animate-fade-in">
                                <label htmlFor="cnft-recipient-address" className="block text-sm font-medium text-gray-300 mb-1">
                                    Recipient Address
                                </label>
                                <input
                                    type="text"
                                    id="cnft-recipient-address"
                                    placeholder="Enter recipient's Solana address"
                                    value={cnft.recipientAddress}
                                    onChange={e => dispatch({type: 'SET_CNFT_FORM', payload: {field: 'recipientAddress', value: e.target.value}})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                                />
                            </div>
                        )}
                    </div>

                    <button onClick={handleMintCnft} className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                      {cnft.loading && <Spinner className="h-5 w-5 mr-2" />}
                      {getButtonText()}
                    </button>
                </div>
              </fieldset>
            </div>
        </Card>
    );
};
