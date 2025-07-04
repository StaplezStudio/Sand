import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAppContext } from '../App';

const Header: React.FC = () => {
  const { connected } = useWallet();
  const { state, handleLoadDatabase, handleSaveDatabase, handleDisconnectAndReset } = useAppContext();
  
  return (
    <>
      <header className="sticky top-0 z-20 bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg">
        <div className="container mx-auto">
            {/* Row 1: Logo and Title. Centered */}
            <div className="flex justify-center items-center gap-4">
                <img src="https://hqufz5ma4uypxm3gnsnlv6can6hc4o4wa7ashogbat3ojayrnkia.arweave.net/PChc9YDlMPuzZmyauvhAb44uO5YHwSO4wQT25IMRapA" alt="S.A.N.D Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-lg" />
                <h1 className="text-center text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Solana Advanced NFT Dashboard (S.A.N.D)
                </h1>
            </div>

            {/* Row 2: Desktop Menu. Centered below title */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              {state.mintHistory.length > 0 ? (
                 <button
                    onClick={handleSaveDatabase}
                    className="h-10 flex items-center cursor-pointer px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition duration-300 text-sm">
                    Save Database
                </button>
              ) : (
                <>
                    <label htmlFor="load-db-input-desktop" className="h-10 flex items-center cursor-pointer px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-300 text-sm">
                        Load Database
                    </label>
                    <input
                        id="load-db-input-desktop"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleLoadDatabase}
                        onClick={(e) => (e.currentTarget.value = '')}
                    />
                </>
              )}
              <WalletMultiButton className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-300 text-sm" />
              <button
                  onClick={handleDisconnectAndReset}
                  className="h-10 flex items-center px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300 text-sm"
                  aria-label="Disconnect wallet and reset session"
              >
                  Reset Wallet
              </button>
            </div>
        </div>
      </header>
    </>
  );
};

export default Header;
