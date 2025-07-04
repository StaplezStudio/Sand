import React from 'react';
import { useAppContext } from '../../App';
import type { Creator, Attribute } from '../../types';
import Card from '../Card';
import { Spinner, CheckCircleIcon, XCircleIcon } from '../icons';

export const ParentNftCard: React.FC = () => {
    const { state, dispatch, handleFetchParentMetadata, handleGenerateParentMetadata, handleMintParentNft, handleResetParentNft } = useAppContext();
    const { parentNft, rpc } = state;
    
    const [fetchUrl, setFetchUrl] = React.useState('');
    
    const isFormDisabled = !rpc.verified || parentNft.loading || parentNft.fetchingMetadata;

    const statusIcon = parentNft.loading || parentNft.fetchingMetadata
        ? <Spinner className="h-5 w-5 text-gray-400" /> 
        : parentNft.address 
        ? <CheckCircleIcon className="h-6 w-6 text-green-400" /> 
        : null;
        
    const ExplorerLink = ({ address }: { address: string }) => {
        const cluster = state.rpc.url.includes('devnet') ? 'devnet' : 'mainnet-beta';
        return (
          <a href={`https://explorer.solana.com/address/${address}?cluster=${cluster}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
            View on Explorer
          </a>
        );
    };

    const handleCreatorChange = (index: number, field: keyof Creator, value: string) => {
        const creators = state.parentNft.creators;
        const newCreators = [...creators];
        const creator = { ...newCreators[index] };
        if (field === 'share') {
            creator.share = Number(value);
        } else {
            creator.address = value;
        }
        newCreators[index] = creator;
        dispatch({ type: 'UPDATE_PARENT_NFT_CREATORS', payload: newCreators });
    };

    const handleAttributeChange = (index: number, field: keyof Attribute, value: string) => {
        dispatch({ type: 'UPDATE_PARENT_ATTRIBUTE', payload: { index, field, value }});
    };
    
    const renderForm = () => {
        if (parentNft.address) {
            return (
                 <div className="text-center space-y-3">
                    <p className="font-semibold text-green-400">{parentNft.isCollection ? 'Collection NFT' : 'NFT'} Minted!</p>
                    <p className="text-sm text-gray-400 break-all">{parentNft.address.toBase58()}</p>
                    <ExplorerLink address={parentNft.address.toBase58()} />
                     <button
                        onClick={handleResetParentNft}
                        className="w-full mt-2 text-sm bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Make New NFT
                    </button>
                </div>
            );
        }

        const isMintDisabled = isFormDisabled || !parentNft.metadataUrl;
        const mintButtonText = parentNft.loading ? `Minting...` : `Mint ${parentNft.isCollection ? 'Collection NFT' : 'NFT'}`;
        const totalCreatorShare = parentNft.creators.reduce((sum, c) => sum + Number(c.share || 0), 0);
        
        return (
            <div className="space-y-4 text-sm">
                <div className="border-b border-gray-700 pb-4">
                    <label htmlFor="fetch-url" className="block font-medium text-gray-300 mb-1">Fetch from Metadata URL (Optional)</label>
                    <div className="flex space-x-2">
                        <input id="fetch-url" type="text" placeholder="https://arweave.net/..." value={fetchUrl} onChange={e => setFetchUrl(e.target.value)} className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" disabled={isFormDisabled} />
                        <button onClick={() => handleFetchParentMetadata(fetchUrl)} disabled={isFormDisabled || !fetchUrl} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex items-center">
                            {parentNft.fetchingMetadata ? <Spinner className="h-5 w-5"/> : 'Fetch'}
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block font-medium text-gray-300 mb-1">Name</label>
                        <input id="name" type="text" value={parentNft.name} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'name', value: e.target.value}})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" disabled={isFormDisabled} />
                    </div>
                    <div>
                        <label htmlFor="symbol" className="block font-medium text-gray-300 mb-1">Symbol</label>
                        <input id="symbol" type="text" value={parentNft.symbol} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'symbol', value: e.target.value}})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" disabled={isFormDisabled} />
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block font-medium text-gray-300">Description</label>
                    <textarea id="description" rows={2} value={parentNft.description} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'description', value: e.target.value}})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white mt-1" disabled={isFormDisabled} />
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block font-medium text-gray-300 mb-1">Image URL</label>
                    <input id="imageUrl" type="text" value={parentNft.imageUrl} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'imageUrl', value: e.target.value}})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" disabled={isFormDisabled} />
                </div>
                 <div>
                    <label htmlFor="sellerFee" className="block font-medium text-gray-300 mb-1">Royalty Percentage</label>
                    <input id="sellerFee" type="number" step="0.1" value={parentNft.sellerFee} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'sellerFee', value: e.target.value}})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" disabled={isFormDisabled} />
                </div>
                <div className="flex justify-around">
                    <div className="flex items-center">
                        <input id="isMutable" type="checkbox" checked={parentNft.isMutable} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'isMutable', value: e.target.checked}})} className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" disabled={isFormDisabled} />
                        <label htmlFor="isMutable" className="ml-2 text-gray-300">Is Mutable</label>
                    </div>
                    <div className="flex items-center">
                        <input id="isCollection" type="checkbox" checked={parentNft.isCollection} onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'isCollection', value: e.target.checked}})} className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" disabled={isFormDisabled} />
                        <label htmlFor="isCollection" className="ml-2 text-gray-300">Is Collection</label>
                    </div>
                </div>

                {/* Attributes Section */}
                {!parentNft.isCollection && (
                    <div className="space-y-3 border-t border-gray-700 pt-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-200">Attributes (Traits)</h4>
                            <button
                                onClick={() => dispatch({ type: 'ADD_PARENT_ATTRIBUTE' })}
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition duration-300 disabled:bg-gray-500"
                                disabled={isFormDisabled}
                            >
                                Add Trait
                            </button>
                        </div>
                        {parentNft.attributes.map((attr, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Trait Type"
                                    value={attr.trait_type}
                                    onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                                    className="col-span-5 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-xs"
                                    disabled={isFormDisabled}
                                />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={attr.value}
                                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                    className="col-span-5 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-xs"
                                    disabled={isFormDisabled}
                                />
                                <button
                                    onClick={() => dispatch({ type: 'REMOVE_PARENT_ATTRIBUTE', payload: index })}
                                    className="col-span-2 text-red-500 hover:text-red-400 disabled:text-gray-500 flex justify-center items-center"
                                    title="Remove Trait"
                                    disabled={isFormDisabled}
                                >
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                        {parentNft.attributes.length === 0 && (
                            <p className="text-xs text-gray-500 text-center">No attributes defined. Add one to describe your NFT.</p>
                        )}
                    </div>
                )}


                {/* Creators */}
                <div className="space-y-2 border-t border-gray-700 pt-4">
                     <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-200">Creators</h4>
                         <span className={`text-xs font-bold ${totalCreatorShare === 100 ? 'text-green-400' : 'text-red-400'}`}>
                            Total Share: {totalCreatorShare}%
                        </span>
                    </div>
                    {parentNft.creators.map((creator, index) => (
                        <div key={index} className="grid grid-cols-10 gap-2">
                           <input type="text" placeholder="Address" value={creator.address} onChange={(e) => handleCreatorChange(index, 'address', e.target.value)} className="col-span-7 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-xs" disabled={isFormDisabled} />
                           <input type="number" placeholder="Share" value={creator.share} onChange={(e) => handleCreatorChange(index, 'share', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-xs" disabled={isFormDisabled} />
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-700 pt-4 space-y-4">
                     <button onClick={handleGenerateParentMetadata} disabled={isFormDisabled} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        Construct Metadata JSON
                    </button>
                    <div>
                        <label htmlFor="metadataUrl" className="block font-medium text-gray-300 mb-1">Metadata URL</label>
                        <input id="metadataUrl" type="text" placeholder="Generate & upload JSON to get this" value={parentNft.metadataUrl} onChange={e => dispatch({type: 'SET_PARENT_METADATA_URL', payload: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" disabled={isFormDisabled} />
                    </div>

                    <div className="space-y-3 rounded-lg border border-gray-700 p-3">
                        <div className="flex items-center">
                            <input
                                id="parent-airdrop-checkbox"
                                type="checkbox"
                                checked={parentNft.mintToDifferentWallet}
                                onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'mintToDifferentWallet', value: e.target.checked}})}
                                className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                                disabled={isFormDisabled}
                            />
                            <label htmlFor="parent-airdrop-checkbox" className="ml-2 text-gray-300">
                                Airdrop to another wallet
                            </label>
                        </div>
                        {parentNft.mintToDifferentWallet && (
                            <div className="animate-fade-in">
                                <label htmlFor="parent-recipient-address" className="block font-medium text-gray-300 mb-1">
                                    Recipient Address
                                </label>
                                <input
                                    id="parent-recipient-address"
                                    type="text"
                                    placeholder="Enter recipient's Solana address"
                                    value={parentNft.recipientAddress}
                                    onChange={e => dispatch({type: 'SET_PARENT_NFT_FORM', payload: {field: 'recipientAddress', value: e.target.value}})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                                    disabled={isFormDisabled}
                                />
                            </div>
                        )}
                    </div>
                    
                    <button onClick={handleMintParentNft} disabled={isMintDisabled} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                         {parentNft.loading && <Spinner className="h-5 w-5 mr-2"/>}
                        {mintButtonText}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Card title="NFT Minter & Metadata Constructer" step={3} statusIcon={statusIcon}>
            <div className="h-full overflow-y-auto pr-2 -mr-4">
                {renderForm()}
            </div>
        </Card>
    );
};