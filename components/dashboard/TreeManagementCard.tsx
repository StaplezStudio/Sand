import React from 'react';
import { useAppContext } from '../../App';
import Card from '../Card';
import { Spinner, CheckCircleIcon, ClipboardIcon } from '../icons';
import { PublicKey } from '@solana/web3.js';

export const TreeManagementCard: React.FC = () => {
    const { state, dispatch, handleCreateTree, handleCopy, handleResetTree } = useAppContext();
    const { tree, rpc, cnft } = state;

    const isTreeActive = React.useMemo(() => {
        if (!cnft.treeAddress) return false;
        try {
            new PublicKey(cnft.treeAddress);
            return true;
        } catch {
            return false;
        }
    }, [cnft.treeAddress]);

    const treeStatusIcon = tree.loading 
        ? <Spinner className="h-5 w-5 text-gray-400" /> 
        : isTreeActive 
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

    const depthOptions = [
        { value: 3, label: '3 (8 leaves)'},
        { value: 5, label: '5 (32 leaves)'},
        { value: 10, label: '10 (1,024 leaves)'},
        { value: 14, label: '14 (16,384 leaves)'},
        { value: 17, label: '17 (131,072 leaves)'},
        { value: 20, label: '20 (~1M leaves)'},
        { value: 24, label: '24 (~16M leaves)'},
        { value: 30, label: '30 (~1B leaves)'},
    ];

    const bufferSizeOptions = [8, 64, 256, 512, 1024, 2048];
    const canopyDepthOptions = Array.from({length: 13}, (_, i) => i);

    return (
        <Card title="Tree Management" step={2} statusIcon={treeStatusIcon}>
        {isTreeActive ? (
          <div className="text-center space-y-3">
              <p className="font-semibold text-green-400">Tree Address Selected</p>
              <div className="bg-gray-900/50 p-2 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-gray-300 font-mono break-all mr-2">
                      {cnft.treeAddress}
                  </p>
                  <button
                      onClick={() => handleCopy(cnft.treeAddress)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Copy Address"
                  >
                      <ClipboardIcon className="h-5 w-5" />
                  </button>
              </div>
              <ExplorerLink address={cnft.treeAddress} />
               <button
                    onClick={handleResetTree}
                    className="w-full text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                   Create a Different Tree
                </button>
          </div>
        ) : tree.loading ? (
             <div className="flex justify-center items-center h-full">
                <div className="text-center space-y-2">
                    <Spinner className="h-8 w-8 text-gray-400 mx-auto" />
                    <p>Creating Tree...</p>
                </div>
            </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="maxDepth" className="block text-sm font-medium text-gray-300 mb-1">Max Depth</label>
              <select
                id="maxDepth"
                value={tree.maxDepth}
                onChange={(e) => dispatch({ type: 'SET_TREE_CONFIG', payload: { field: 'maxDepth', value: Number(e.target.value) }})}
                disabled={!rpc.verified || tree.loading}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              >
                {depthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="maxBufferSize" className="block text-sm font-medium text-gray-300 mb-1">Max Buffer Size</label>
              <select
                id="maxBufferSize"
                value={tree.maxBufferSize}
                onChange={(e) => dispatch({ type: 'SET_TREE_CONFIG', payload: { field: 'maxBufferSize', value: Number(e.target.value) }})}
                disabled={!rpc.verified || tree.loading}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              >
                {bufferSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="canopyDepth" className="block text-sm font-medium text-gray-300 mb-1">Canopy Depth</label>
              <select
                id="canopyDepth"
                value={tree.canopyDepth}
                onChange={(e) => dispatch({ type: 'SET_TREE_CONFIG', payload: { field: 'canopyDepth', value: Number(e.target.value) }})}
                disabled={!rpc.verified || tree.loading}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              >
                {canopyDepthOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Size of the proof stored on-chain.</p>
            </div>
            <button
              onClick={handleCreateTree}
              disabled={!rpc.verified || tree.loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {tree.loading && <Spinner className="h-5 w-5 mr-2" />}
              {tree.loading ? 'Creating...' : 'Create Tree'}
            </button>
          </div>
        )}
      </Card>
    );
};