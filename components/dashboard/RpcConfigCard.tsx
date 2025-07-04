
import React from 'react';
import { useAppContext } from '../../App';
import Card from '../Card';
import { Spinner, CheckCircleIcon, XCircleIcon } from '../icons';

export const RpcConfigCard: React.FC = () => {
    const { state, dispatch, handleVerifyRpc, handleAirdrop } = useAppContext();
    const { rpc } = state;
    
    const [cooldown, setCooldown] = React.useState(0);

    React.useEffect(() => {
        if (!rpc.airdropCooldownEnd) {
            setCooldown(0);
            return;
        }

        const intervalId = setInterval(() => {
            const secondsLeft = Math.ceil((rpc.airdropCooldownEnd! - Date.now()) / 1000);
            if (secondsLeft > 0) {
                setCooldown(secondsLeft);
            } else {
                setCooldown(0);
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [rpc.airdropCooldownEnd]);
    
    const rpcStatusIcon = rpc.loading 
        ? <Spinner className="h-5 w-5 text-gray-400" /> 
        : rpc.verified 
        ? <CheckCircleIcon className="h-6 w-6 text-green-400" /> 
        : <XCircleIcon className="h-6 w-6 text-red-400" />;
        
    const isDevnet = rpc.verified && rpc.url.includes('devnet');
    const isActionInProgress = rpc.loading || rpc.airdropping;
    const isAirdropDisabled = isActionInProgress || cooldown > 0;
    const airdropButtonText = rpc.airdropping ? 'Airdropping...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Airdrop 2 SOL';


    return (
         <Card title="RPC Configuration" step={1} statusIcon={rpcStatusIcon}>
            <div className="space-y-4">
              <div>
                <label htmlFor="rpc-url" className="block text-sm font-medium text-gray-300">RPC Endpoint URL</label>
                <input
                  type="text"
                  id="rpc-url"
                  value={rpc.url}
                  onChange={(e) => dispatch({ type: 'SET_RPC_URL', payload: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white disabled:opacity-50"
                  placeholder="https://api.devnet.solana.com"
                  disabled={isActionInProgress}
                />
              </div>
              <button
                onClick={handleVerifyRpc}
                disabled={isActionInProgress}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                {rpc.loading ? 'Verifying...' : 'Verify & Connect'}
              </button>
              
              {isDevnet && (
                  <button
                    onClick={handleAirdrop}
                    disabled={isAirdropDisabled}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    {rpc.airdropping && <Spinner className="h-5 w-5 mr-2" />}
                    {airdropButtonText}
                  </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-4">
                <details>
                    <summary className="cursor-pointer hover:text-gray-300 transition-colors">
                        <strong>IMPORTANT:</strong> Read Disclaimer Before Use
                    </summary>
                    <div className="mt-3 space-y-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-gray-400">
                        <p>This software is provided "as is", without warranty. By using it, you assume all risks.</p>
                        <p><strong>No Liability:</strong> The creator is not liable for any losses, including loss of funds, from using this tool.</p>
                        <p><strong>Irreversible Actions:</strong> All blockchain transactions are final. Double-check everything before confirming.</p>
                        <p><strong>Security:</strong> You are responsible for your wallet's security. Never share your private keys. Be aware of phishing risks.</p>
                        <p><strong>No Financial Advice:</strong> This tool is for educational and technical purposes only. It is not financial advice.</p>
                        <p className="font-semibold text-gray-300">By proceeding, you confirm you understand and accept these terms.</p>
                    </div>
                </details>
            </div>
          </Card>
    );
};