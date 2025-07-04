import type { Umi } from '@metaplex-foundation/umi';
export type { Umi };
import type { PublicKey } from '@solana/web3.js';
import type { ReactNode } from 'react';

export interface Creator {
  address: string;
  share: number;
}

export interface Attribute {
  trait_type: string;
  value: string;
}

export type RpcCluster = 'devnet' | 'mainnet-beta' | 'custom';

// The structure of the save file
export interface DatabaseFile {
  rpcUrl: string;
  treeAddress: string | null;
  mintHistory: MintedNft[];
}

export interface NftFormState {
    address: PublicKey | null;
    loading: boolean;
    fetchingMetadata: boolean;
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    sellerFee: number;
    isMutable: boolean;
    isCollection: boolean;
    creators: Creator[];
    attributes: Attribute[];
    generatedJson: string | null;
    showMetadataViewer: boolean;
    metadataUrl: string;
    mintToDifferentWallet: boolean;
    recipientAddress: string;
}

// The main application state
export interface AppState {
  rpc: {
    url: string;
    verified: boolean;
    loading: boolean;
    airdropping: boolean;
    airdropCooldownEnd: number | null;
  };
  tree: {
    address: PublicKey | null;
    loading: boolean;
    maxDepth: number;
    maxBufferSize: number;
    canopyDepth: number;
  };
  parentNft: NftFormState; // Legacy Token Metadata
  cnft: {
    useExistingMetadata: boolean;
    treeAddress: string;
    collectionAddress: string;
    loading: boolean;
    fetchingMetadata: boolean;
    metadataUrl: string; // For existing metadata
    name: string; // For new metadata
    symbol: string; // For new metadata
    description: string; // For new metadata
    imageUrl: string; // For new metadata
    mintToCollection: boolean;
    mintToDifferentWallet: boolean;
    recipientAddress: string;
  };
  mintHistory: MintedNft[];
}

// Represents a single item in the mint activity history
export interface MintedNft {
  id: string; // The transaction signature, for React keys
  name: string;
  type: 'cNFT' | 'Parent NFT' | 'Merkle Tree' | 'NFT';
  transactionId: string;
  cluster: RpcCluster;
  address?: string; // The on-chain address of the created asset
  isCollection?: boolean; // For Parent NFTs
  metadataUrl?: string;
  collectionAddress?: string;
}

// Defines the shape of the context provided to all dashboard components
export interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    umi: Umi | null;
    addNotification: (type: NotificationType, message: string, details?: ReactNode) => void;
    handleVerifyRpc: () => Promise<void>;
    handleAirdrop: () => Promise<void>;
    handleCreateTree: () => Promise<void>;
    handleResetTree: () => void;
    // Legacy
    handleFetchParentMetadata: (url: string) => Promise<void>;
    handleGenerateParentMetadata: () => void;
    handleHideMetadataViewer: () => void;
    handleMintParentNft: () => Promise<void>;
    handleResetParentNft: () => void;
    // Common
    handleFetchCnftMetadata: (url: string) => Promise<void>;
    handleMintCnft: () => Promise<void>;
    handleCopy: (text: string, message?: string) => void;
    handleSaveDatabase: () => void;
    handleLoadDatabase: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectHistoryItem: (item: MintedNft) => void;
    handleDisconnectAndReset: () => void;
}

// A mapped type to create a discriminated union for the cNFT form action.
// This ensures that the `value` type correctly corresponds to the `field`.
type CnftFormActionPayload = {
    [K in keyof Omit<AppState['cnft'], 'loading' | 'fetchingMetadata'>]: { field: K; value: AppState['cnft'][K] };
}[keyof Omit<AppState['cnft'], 'loading' | 'fetchingMetadata'>];

// All possible actions for the app reducer
export type Action =
  | { type: 'SET_RPC_URL'; payload: string }
  | { type: 'SET_RPC_STATUS'; payload: { verified: boolean; loading: boolean } }
  | { type: 'AIRDROP_START' }
  | { type: 'AIRDROP_FINISH' }
  | { type: 'SET_AIRDROP_COOLDOWN_END', payload: number | null }
  | { type: 'CREATE_TREE_START' }
  | { type: 'CREATE_TREE_SUCCESS'; payload: PublicKey }
  | { type: 'CREATE_TREE_FAILURE' }
  | { type: 'SET_TREE_CONFIG'; payload: { field: 'maxDepth' | 'maxBufferSize' | 'canopyDepth'; value: number } }
  | { type: 'RESET_TREE_SELECTION' }
  // Legacy Parent NFT Actions
  | { type: 'SET_PARENT_NFT_FORM'; payload: { field: keyof Omit<NftFormState, 'creators' | 'attributes' | 'loading' | 'address' | 'generatedJson' | 'showMetadataViewer' | 'metadataUrl' | 'fetchingMetadata' | 'generatingDescription'>; value: string | number | boolean } }
  | { type: 'SET_ALL_PARENT_NFT_FORM_FIELDS', payload: Partial<NftFormState> }
  | { type: 'UPDATE_PARENT_NFT_CREATORS'; payload: Creator[] }
  | { type: 'ADD_PARENT_ATTRIBUTE' }
  | { type: 'REMOVE_PARENT_ATTRIBUTE', payload: number }
  | { type: 'UPDATE_PARENT_ATTRIBUTE', payload: { index: number; field: keyof Attribute; value: string } }
  | { type: 'FETCH_PARENT_METADATA_START' }
  | { type: 'FETCH_PARENT_METADATA_FINISH' }
  | { type: 'GENERATE_PARENT_METADATA'; payload: string }
  | { type: 'HIDE_METADATA_VIEWER' }
  | { type: 'SET_PARENT_METADATA_URL'; payload: string }
  | { type: 'RESET_PARENT_NFT_FORM' }
  | { type: 'MINT_PARENT_START' }
  | { type: 'MINT_PARENT_SUCCESS'; payload: PublicKey }
  | { type: 'MINT_PARENT_FAILURE' }
  // cNFT Actions
  | { type: 'SET_CNFT_FORM'; payload: CnftFormActionPayload }
  | { type: 'FETCH_CNFT_METADATA_START' }
  | { type: 'FETCH_CNFT_METADATA_FINISH'; payload: { imageUrl: string; name: string; symbol: string } }
  | { type: 'MINT_CNFT_START' }
  | { type: 'MINT_CNFT_SUCCESS' }
  | { type: 'MINT_CNFT_FAILURE' }
  | { type: 'ADD_TO_HISTORY'; payload: MintedNft }
  | { type: 'LOAD_DATABASE'; payload: DatabaseFile }
  | { type: 'RESET_APP_STATE' };

// A type for the mobile navigation view, currently unused but defined for component compilation.
export type MobileView = 'tree' | 'parentNft' | 'cnft' | 'history';

// Notification system types
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  details?: ReactNode;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, details?: ReactNode) => void;
}
