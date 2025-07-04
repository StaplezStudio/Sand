import React from 'react';
import { DropdownMenu } from './DropdownMenu';
import type { DropdownItemDef } from './DropdownMenu';

interface TopMenuBarProps {
    onUrlChange: (url: string) => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({ onUrlChange }) => {
    const rpcProviders: DropdownItemDef[] = [
        { name: 'Helius', url: 'https://dashboard.helius.dev/login', external: true },
        { name: 'QuickNode', url: 'https://www.quicknode.com/solana', external: true },
        { name: 'Alchemy', url: 'https://www.alchemy.com/solana', external: true },
        { name: 'Ankr', url: 'https://www.ankr.com/rpc/solana/', external: true },
        { name: 'Syndica', url: 'https://syndica.io/', external: true },
        { name: 'GenesysGo', url: 'https://genesysgo.com/', external: true },
    ];
    
    const services: DropdownItemDef[] = [
        { name: 'Storage', isHeader: true },
        { name: 'ArDrive Web App', url: 'https://app.ardrive.io/' },
        { name: 'Pinata', url: 'https://app.pinata.cloud/login', external: true },
        { name: 'web3.storage', url: 'https://web3.storage/login/', external: true },
        { name: 'Explorers', isHeader: true },
        { name: 'Solana Explorer', url: 'https://explorer.solana.com/' },
        { name: 'Solscan', url: 'https://solscan.io/' },
        { name: 'SolanaFM', url: 'https://solana.fm/' },
        { name: 'DeFi', isHeader: true },
        { name: 'Jupiter Aggregator', url: 'https://jup.ag/' },
    ];

    return (
        <div className="bg-gray-900/50 w-full px-4 py-1 flex items-center space-x-2 border-b border-gray-700 shadow-sm flex-shrink-0">
            <DropdownMenu title="RPC Providers" items={rpcProviders} onItemClick={onUrlChange} />
            <DropdownMenu title="Services" items={services} onItemClick={onUrlChange} />
            <a
                href="https://foosunmoving.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 focus:bg-gray-700 rounded-md focus:outline-none transition-colors"
            >
                Affiliates
            </a>
        </div>
    );
};
