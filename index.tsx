import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import App from './App';

// --- MOBILE DEVICE DETECTOR & LIABILITY DISCLAIMER GATE ---
const MobileSafetyGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [bypassGate, setBypassGate] = useState(false);

    useEffect(() => {
        // Check if they already clicked yes in this session
        if (sessionStorage.getItem('sand_mobile_liability_accepted') === 'true') {
            setBypassGate(true);
            // Force global flags in case App.tsx checks window properties
            (window as any).isMobileBypassed = true;
            return;
        }

        // Detect common mobile layouts / mobile user agents
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            setIsMobile(true);
        }
    }, []);

    const handleProceed = () => {
        sessionStorage.setItem('sand_mobile_liability_accepted', 'true');
        (window as any).isMobileBypassed = true;
        setBypassGate(true);
        
        // Force a quick window resize event in case App.tsx uses a listener 
        // to calculate desktop vs mobile layouts
        window.dispatchEvent(new Event('resize'));
    };

    if (isMobile && !bypassGate) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950 p-6 animate-fade-in">
                <div className="max-w-md w-full bg-gray-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center">
                    {/* Warning Alert Icon */}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mb-4">
                        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>

                    <h2 className="text-xl font-bold text-gray-100 tracking-tight mb-2">
                        Mobile Compatibility Warning
                    </h2>
                    
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        Solana Web3 wallet extensions are fundamentally restricted on mobile web browsers. Compressed NFT rendering and wallet signature executions may fail entirely outside of native dApp companion browsers.
                    </p>

                    {/* Liability Disclaimer Segment */}
                    <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-4 text-left mb-6">
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-1">
                            Liability Disclaimer
                        </span>
                        <p className="text-xs text-gray-400 leading-normal">
                            By choosing to proceed, you explicitly acknowledge that **nobody but you holds any liability** for whatever happens next. You accept full responsibility for all operational failures, signature timeouts, or transactional execution issues on mobile.
                        </p>
                    </div>

                    {/* Interaction Triggers */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleProceed}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-200 ease-in-out shadow-lg shadow-red-600/20"
                        >
                            I understand, continue anyways
                        </button>
                        <a
                            href="https://phantom.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm py-3 px-4 rounded-xl transition duration-200 ease-in-out block"
                        >
                            Open in Native Wallet App
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const AppWrapper: React.FC = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = React.useMemo(() => clusterApiUrl(network), [network]);

    const wallets = React.useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <MobileSafetyGate>
                        <App />
                    </MobileSafetyGate>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
