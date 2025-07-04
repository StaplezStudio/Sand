import React, { useReducer, useEffect, useCallback, createContext, useContext, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { generateSigner, percentAmount, some, none, publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { createTree, mintToCollectionV1, mintV1, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { AppState, Action, MintedNft, RpcCluster, AppContextType, DatabaseFile, NftFormState, Umi } from './types';
import { useNotifications } from './hooks/useNotifications';
import { getErrorMessage } from './lib/utils';
import Header from './components/Header';
import NotificationProvider from './components/NotificationProvider';
import { RpcConfigCard } from './components/dashboard/RpcConfigCard';
import { TreeManagementCard } from './components/dashboard/TreeManagementCard';
import { ParentNftCard } from './components/dashboard/ParentNftCard';
import { CnftMintingCard } from './components/dashboard/CnftMintingCard';
import { MintHistory } from './components/dashboard/MintHistory';
import MetadataViewer from './components/MetadataViewer';
import { ArdriveUploader } from './components/ArdriveUploader';
import { ImagePreviewCard } from './components/dashboard/ImagePreviewCard';
import type { ReactNode } from 'react';
import { DesktopComputerIcon } from './components/icons';
import useIsMobile from './hooks/useIsMobile';
import SaveModal from './components/SaveModal';

// --- App Context ---
// This allows us to share state and handlers without prop drilling
const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

const initialNftFormState: NftFormState = {
    address: null,
    loading: false,
    fetchingMetadata: false,
    name: 'Unnamed NFT',
    symbol: 'SAND',
    description: 'A collection of digital art Minted with The Solana Advanced NFT Dashboard (S.A.N.D) program made by: Staplez Studio.',
    imageUrl: '',
    externalUrl: '',
    sellerFee: 0,
    isMutable: true,
    isCollection: true,
    creators: [],
    attributes: [],
    generatedJson: null,
    showMetadataViewer: false,
    metadataUrl: '',
    mintToDifferentWallet: false,
    recipientAddress: '',
};

// --- Initial State and Reducer ---
const initialState: AppState = {
  rpc: {
    url: 'https://api.devnet.solana.com',
    verified: false,
    loading: false,
    airdropping: false,
    airdropCooldownEnd: null,
  },
  tree: {
    address: null,
    loading: false,
    maxDepth: 5,
    maxBufferSize: 8,
    canopyDepth: 0,
  },
  parentNft: { ...initialNftFormState }, // for legacy mpl-token-metadata
  cnft: {
    useExistingMetadata: true,
    treeAddress: '',
    collectionAddress: '',
    loading: false,
    fetchingMetadata: false,
    metadataUrl: 'https://arweave.net/z_U8Fw7a_3c2B2a_8c1D1f_E3g5h_7j_9k_L0m_N1o',
    name: 'Unnamed NFT',
    symbol: 'SAND',
    description: '',
    imageUrl: '',
    mintToCollection: false,
    mintToDifferentWallet: false,
    recipientAddress: '',
  },
  mintHistory: [],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_RPC_URL':
      return { ...state, rpc: { ...state.rpc, url: action.payload, verified: false } };
    case 'SET_RPC_STATUS':
      return { ...state, rpc: { ...state.rpc, ...action.payload } };
    case 'AIRDROP_START':
      return { ...state, rpc: { ...state.rpc, airdropping: true }};
    case 'AIRDROP_FINISH':
      return { ...state, rpc: { ...state.rpc, airdropping: false }};
    case 'SET_AIRDROP_COOLDOWN_END':
      return { ...state, rpc: { ...state.rpc, airdropCooldownEnd: action.payload } };
    case 'CREATE_TREE_START':
      return { ...state, tree: { ...state.tree, loading: true } };
    case 'CREATE_TREE_SUCCESS':
      return {
        ...state,
        tree: { ...state.tree, loading: false, address: action.payload },
        cnft: { ...state.cnft, treeAddress: action.payload.toBase58() },
      };
    case 'CREATE_TREE_FAILURE':
      return { ...state, tree: { ...state.tree, loading: false } };
    case 'SET_TREE_CONFIG':
        return { ...state, tree: { ...state.tree, [action.payload.field]: action.payload.value } };
    case 'RESET_TREE_SELECTION':
        return {
            ...state,
            tree: { ...state.tree, address: null },
            cnft: { ...state.cnft, treeAddress: '' },
        };
    // --- Legacy Parent NFT Reducers ---
    case 'SET_PARENT_NFT_FORM': {
      const { field, value } = action.payload;

      // Special handling for the 'isCollection' checkbox
      if (field === 'isCollection') {
        const isNowCollection = value as boolean;
        return {
          ...state,
          parentNft: {
            ...state.parentNft,
            isCollection: isNowCollection,
            // When an NFT is marked as a collection, clear its attributes.
            // When it's marked as a standard NFT, add a default attribute.
            attributes: isNowCollection ? [] : [{ trait_type: 'type', value: '' }],
          },
        };
      }
      
      // Default behavior for all other form fields
      return { ...state, parentNft: { ...state.parentNft, [field]: value } };
    }
    case 'SET_ALL_PARENT_NFT_FORM_FIELDS':
      return { ...state, parentNft: { ...state.parentNft, ...action.payload }};
    case 'UPDATE_PARENT_NFT_CREATORS':
      return { ...state, parentNft: { ...state.parentNft, creators: action.payload }};
    case 'ADD_PARENT_ATTRIBUTE':
        return { ...state, parentNft: { ...state.parentNft, attributes: [...state.parentNft.attributes, { trait_type: '', value: '' }] }};
    case 'REMOVE_PARENT_ATTRIBUTE':
        return { ...state, parentNft: { ...state.parentNft, attributes: state.parentNft.attributes.filter((_, i) => i !== action.payload) }};
    case 'UPDATE_PARENT_ATTRIBUTE': {
      const newAttributes = [...state.parentNft.attributes];
      newAttributes[action.payload.index] = { ...newAttributes[action.payload.index], [action.payload.field]: action.payload.value };
      return { ...state, parentNft: { ...state.parentNft, attributes: newAttributes } };
    }
    case 'FETCH_PARENT_METADATA_START':
      return { ...state, parentNft: { ...state.parentNft, fetchingMetadata: true } };
    case 'FETCH_PARENT_METADATA_FINISH':
      return { ...state, parentNft: { ...state.parentNft, fetchingMetadata: false } };
    case 'GENERATE_PARENT_METADATA':
      return { ...state, parentNft: { ...state.parentNft, generatedJson: action.payload, showMetadataViewer: true }};
    case 'HIDE_METADATA_VIEWER':
      return { ...state, parentNft: { ...state.parentNft, showMetadataViewer: false }};
    case 'SET_PARENT_METADATA_URL':
        return { ...state, parentNft: { ...state.parentNft, metadataUrl: action.payload }};
    case 'RESET_PARENT_NFT_FORM':
        return { ...state, parentNft: { ...initialNftFormState, address: null, creators: state.parentNft.creators }};
    case 'MINT_PARENT_START':
      return { ...state, parentNft: { ...state.parentNft, loading: true } };
    case 'MINT_PARENT_SUCCESS':
      return {
        ...state,
        parentNft: { ...state.parentNft, loading: false, address: action.payload },
        cnft: { ...state.cnft, collectionAddress: action.payload.toBase58() },
      };
    case 'MINT_PARENT_FAILURE':
      return { ...state, parentNft: { ...state.parentNft, loading: false } };

    // --- cNFT Reducers ---
    case 'SET_CNFT_FORM':
      if (action.payload.field === 'mintToCollection' && action.payload.value === false) {
          return { ...state, cnft: { ...state.cnft, mintToCollection: false, collectionAddress: '' } };
      }
      return { ...state, cnft: { ...state.cnft, [action.payload.field]: action.payload.value } };
    case 'FETCH_CNFT_METADATA_START':
        return { ...state, cnft: { ...state.cnft, fetchingMetadata: true }};
    case 'FETCH_CNFT_METADATA_FINISH':
        return { ...state, cnft: { ...state.cnft, fetchingMetadata: false, ...action.payload }};
    case 'MINT_CNFT_START':
      return { ...state, cnft: { ...state.cnft, loading: true } };
    case 'MINT_CNFT_SUCCESS':
    case 'MINT_CNFT_FAILURE':
      return { ...state, cnft: { ...state.cnft, loading: false } };
    case 'ADD_TO_HISTORY':
      return { ...state, mintHistory: [action.payload, ...state.mintHistory] };
    case 'LOAD_DATABASE':
        const { rpcUrl, treeAddress, mintHistory } = action.payload;
        const newTreeAddress = treeAddress ? new PublicKey(treeAddress) : null;
        return {
            ...state,
            rpc: { ...state.rpc, url: rpcUrl, verified: false }, // Force re-verification
            tree: { ...state.tree, address: newTreeAddress },
            cnft: { ...state.cnft, treeAddress: treeAddress || '' },
            mintHistory,
        };
    case 'RESET_APP_STATE':
        // Reset to initial state, but preserve the RPC URL for user convenience.
        return {
            ...initialState,
            rpc: {
                ...initialState.rpc,
                url: state.rpc.url,
            },
        };
    default:
      return state;
  }
};

const getClusterFromUrl = (url: string): RpcCluster => {
    if (url.includes('devnet')) return 'devnet';
    if (url.includes('mainnet-beta')) return 'mainnet-beta';
    return 'custom';
}

const ExplorerLink = ({ signature, address, cluster }: { signature?: string; address?: string; cluster: RpcCluster }) => {
    const clusterQuery = cluster === 'custom' ? '' : `?cluster=${cluster}`;
    const url = signature
      ? `https://explorer.solana.com/tx/${signature}${clusterQuery}`
      : `https://explorer.solana.com/address/${address}${clusterQuery}`;

    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
        View on Explorer
      </a>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
  const isMobile = useIsMobile();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { notifications, addNotification, removeNotification } = useNotifications();
  const wallet = useWallet();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Create a single, unified UMI instance with all necessary plugins.
  const umi = useMemo(() => {
    if (!state.rpc.verified || !wallet.publicKey) return null;
    return createUmi(state.rpc.url)
        .use(walletAdapterIdentity(wallet))
        .use(mplBubblegum())
        .use(mplTokenMetadata());
  }, [state.rpc.url, state.rpc.verified, wallet.publicKey, wallet.connected]);


  // Initialize creators list when wallet connects
  useEffect(() => {
    if (umi && umi.identity.publicKey) {
        const creatorPayload = [{ address: umi.identity.publicKey.toString(), share: 100 }];
        if (state.parentNft.creators.length === 0 || state.parentNft.creators[0].address !== umi.identity.publicKey.toString()) {
             dispatch({ type: 'UPDATE_PARENT_NFT_CREATORS', payload: creatorPayload });
        }
    }
  }, [umi]);
  
  // --- Action Handlers ---
  const handleVerifyRpc = useCallback(async () => {
    dispatch({ type: 'SET_RPC_STATUS', payload: { verified: false, loading: true } });
    try {
      const connection = new Connection(state.rpc.url);
      await connection.getVersion();
      dispatch({ type: 'SET_RPC_STATUS', payload: { verified: true, loading: false } });
      addNotification('success', 'RPC endpoint verified successfully!');
    } catch (e) {
      dispatch({ type: 'SET_RPC_STATUS', payload: { verified: false, loading: false } });
      addNotification('error', 'Failed to verify RPC endpoint.', getErrorMessage(e));
    }
  }, [state.rpc.url, addNotification]);
  
  const handleAirdrop = useCallback(async () => {
    if (state.rpc.airdropCooldownEnd && Date.now() < state.rpc.airdropCooldownEnd) {
      const secondsLeft = Math.ceil((state.rpc.airdropCooldownEnd - Date.now()) / 1000);
      addNotification('info', `Please wait ${secondsLeft} seconds before requesting another airdrop.`);
      return;
    }
    if (!umi || !umi.identity.publicKey) {
      addNotification('error', 'Please connect your wallet to continue.');
      return;
    }
    dispatch({ type: 'AIRDROP_START' });
    try {
      const connection = new Connection(state.rpc.url, 'confirmed');
      const signature = await connection.requestAirdrop(
        new PublicKey(umi.identity.publicKey),
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature, 'confirmed');
       addNotification('success', 'Airdrop successful!', <ExplorerLink signature={signature} cluster="devnet" />);
       const cooldownMs = 30000; // 30-second cooldown
       dispatch({ type: 'SET_AIRDROP_COOLDOWN_END', payload: Date.now() + cooldownMs });
    } catch (e: any) {
      if (typeof e.message === 'string' && (e.message.includes('429') || e.message.toLowerCase().includes('too many requests'))) {
          addNotification('error', 'Too many airdrop requests.', 'Please wait a moment before trying again.');
      } else {
        addNotification('error', 'Airdrop failed.', getErrorMessage(e));
      }
    } finally {
      dispatch({ type: 'AIRDROP_FINISH' });
    }
  }, [state.rpc.url, state.rpc.airdropCooldownEnd, umi, addNotification, dispatch]);

  const handleCreateTree = useCallback(async () => {
    if (!umi) {
      addNotification('error', 'Please connect your wallet to continue.');
      return;
    }
    dispatch({ type: 'CREATE_TREE_START' });
    try {
      const merkleTree = generateSigner(umi);
      const builder = await createTree(umi, {
        merkleTree,
        treeCreator: umi.identity,
        maxDepth: state.tree.maxDepth,
        maxBufferSize: state.tree.maxBufferSize,
        canopyDepth: state.tree.canopyDepth,
        public: false,
      });

      const { signature } = await builder.sendAndConfirm(umi, { confirm: { commitment: 'finalized' } });
      
      const treeAddress = merkleTree.publicKey;

      dispatch({ type: 'CREATE_TREE_SUCCESS', payload: new PublicKey(treeAddress) });
      const txId = base58.deserialize(signature)[0];
      const newHistoryItem: MintedNft = {
        id: txId,
        name: `Merkle Tree (${state.tree.maxDepth}, ${state.tree.maxBufferSize})`,
        type: 'Merkle Tree',
        transactionId: txId,
        cluster: getClusterFromUrl(state.rpc.url),
        address: treeAddress.toString(),
      };
      dispatch({ type: 'ADD_TO_HISTORY', payload: newHistoryItem });

      addNotification('success', 'Merkle Tree created successfully!', 
        <ExplorerLink address={treeAddress.toString()} cluster={getClusterFromUrl(state.rpc.url)} />);
    } catch (e) {
      dispatch({ type: 'CREATE_TREE_FAILURE' });
      addNotification('error', 'Failed to create Merkle Tree.', getErrorMessage(e));
    }
  }, [umi, state.tree, state.rpc.url, addNotification]);

  const handleResetTree = useCallback(() => {
    dispatch({ type: 'RESET_TREE_SELECTION' });
    addNotification('info', 'Tree selection has been reset.');
  }, [addNotification]);
  
  const handleFetchParentMetadata = useCallback(async (url: string) => {
    if (!url) {
      addNotification('error', 'Please provide a metadata URL.');
      return;
    }
    dispatch({ type: 'FETCH_PARENT_METADATA_START' });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Could not read server response.');
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorBody}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (contentType && contentType.startsWith('image/')) {
            throw new Error("Invalid URL: The URL points to an image, not a JSON metadata file.");
        }
        throw new Error("Invalid response: The server did not return a JSON file.");
      }

      const metadata = await response.json();
      
      const formStateUpdate: Partial<NftFormState> = {
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          imageUrl: metadata.image,
          externalUrl: metadata.external_url || '',
          sellerFee: metadata.seller_fee_basis_points / 100,
          isMutable: metadata.is_mutable !== undefined ? metadata.is_mutable : true,
          attributes: metadata.attributes || [],
          creators: (metadata.properties?.creators || []).map((c: any) => ({
              address: c.address,
              share: c.share,
          })),
          isCollection: !!metadata.collection,
      };
      dispatch({ type: 'SET_ALL_PARENT_NFT_FORM_FIELDS', payload: formStateUpdate });
      dispatch({ type: 'SET_PARENT_METADATA_URL', payload: url });

      addNotification('success', 'Metadata fetched and form populated.');
    } catch (e) {
      addNotification('error', 'Failed to fetch metadata.', getErrorMessage(e));
    } finally {
      dispatch({ type: 'FETCH_PARENT_METADATA_FINISH' });
    }
  }, [addNotification]);

  const handleGenerateParentMetadata = useCallback(() => {
    const { parentNft } = state;
    const metadataJson = {
      name: parentNft.name,
      symbol: parentNft.symbol,
      description: parentNft.description,
      image: parentNft.imageUrl,
      external_url: parentNft.externalUrl,
      seller_fee_basis_points: parentNft.sellerFee * 100,
      attributes: parentNft.attributes,
      properties: {
        files: [{ uri: parentNft.imageUrl, type: 'image/png' }],
        creators: parentNft.creators,
      },
      collection: parentNft.isCollection ? { name: parentNft.name, family: parentNft.symbol } : undefined,
    };
    const jsonString = JSON.stringify(metadataJson, null, 2);
    dispatch({ type: 'GENERATE_PARENT_METADATA', payload: jsonString });
  }, [state.parentNft]);

  const handleHideMetadataViewer = useCallback(() => {
    dispatch({ type: 'HIDE_METADATA_VIEWER' });
  }, []);

  const handleMintParentNft = useCallback(async () => {
    if (!umi) {
      addNotification('error', 'Please connect your wallet to continue.');
      return;
    }
    const { parentNft } = state;
    if (!parentNft.metadataUrl) {
        addNotification('error', 'Metadata URL is required to mint.');
        return;
    }

    dispatch({ type: 'MINT_PARENT_START' });
    try {
        const mint = generateSigner(umi);
        
        let mintTo: PublicKey | undefined;
        if (parentNft.mintToDifferentWallet && parentNft.recipientAddress) {
            try {
                mintTo = new PublicKey(parentNft.recipientAddress);
            } catch {
                addNotification('error', 'Invalid recipient address.');
                dispatch({ type: 'MINT_PARENT_FAILURE' });
                return;
            }
        }

        const tx = createNft(umi, {
            mint,
            name: parentNft.name,
            uri: parentNft.metadataUrl,
            sellerFeeBasisPoints: percentAmount(parentNft.sellerFee),
            isMutable: parentNft.isMutable,
            isCollection: parentNft.isCollection,
            collection: none(),
            creators: some(parentNft.creators.map(c => ({ address: publicKey(c.address), verified: false, share: c.share }))),
            tokenOwner: mintTo ? publicKey(mintTo) : umi.identity.publicKey,
        });

        const { signature } = await tx.sendAndConfirm(umi);

        const mintAddress = mint.publicKey;
        dispatch({ type: 'MINT_PARENT_SUCCESS', payload: new PublicKey(mintAddress) });

        const txId = base58.deserialize(signature)[0];
        const newHistoryItem: MintedNft = {
          id: txId,
          name: parentNft.name,
          type: parentNft.isCollection ? 'Parent NFT' : 'NFT',
          isCollection: parentNft.isCollection,
          transactionId: txId,
          cluster: getClusterFromUrl(state.rpc.url),
          address: mintAddress.toString(),
          metadataUrl: parentNft.metadataUrl,
        };
        dispatch({ type: 'ADD_TO_HISTORY', payload: newHistoryItem });

        addNotification('success', `${newHistoryItem.type} minted successfully!`,
          <ExplorerLink address={mintAddress.toString()} cluster={getClusterFromUrl(state.rpc.url)} />);

    } catch (e) {
        dispatch({ type: 'MINT_PARENT_FAILURE' });
        const itemType = state.parentNft.isCollection ? 'Parent NFT' : 'NFT';
        addNotification('error', `Failed to mint ${itemType}.`, getErrorMessage(e));
    }
  }, [umi, state.parentNft, state.rpc.url, addNotification]);
  
  const handleResetParentNft = useCallback(() => {
    dispatch({ type: 'RESET_PARENT_NFT_FORM' });
    // Also reset the collection selection in the cNFT card for a clean slate.
    dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'mintToCollection', value: false }});
    dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'collectionAddress', value: '' }});
    addNotification('info', 'NFT Minter form has been reset.');
  }, [addNotification]);

  const handleFetchCnftMetadata = useCallback(async (url: string) => {
    if (!url) {
      addNotification('error', 'Please provide a metadata URL.');
      return;
    }
    dispatch({ type: 'FETCH_CNFT_METADATA_START' });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Could not read server response.');
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorBody}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
          if (contentType && contentType.startsWith('image/')) {
            throw new Error("Invalid URL: Provided URL is for an image, not JSON metadata.");
          }
          throw new Error('Response was not valid JSON. Please check the URL.');
      }

      const data = await response.json();
      
      if (!data.image || !data.name || !data.symbol) {
          throw new Error('Metadata is missing required fields (image, name, symbol).');
      }

      dispatch({
        type: 'FETCH_CNFT_METADATA_FINISH',
        payload: { imageUrl: data.image, name: data.name, symbol: data.symbol },
      });
      addNotification('success', 'Metadata preview loaded.');
    } catch (e) {
      addNotification('error', 'Failed to fetch or parse metadata.', getErrorMessage(e));
      dispatch({ type: 'FETCH_CNFT_METADATA_FINISH', payload: { imageUrl: '', name: 'Error', symbol: 'ERR' } });
    }
  }, [addNotification]);

  const handleMintCnft = useCallback(async () => {
    if (!umi) {
      addNotification('error', 'Please connect your wallet to continue.');
      return;
    }
    const { cnft } = state;
    if (!cnft.treeAddress) {
        addNotification('error', 'Merkle Tree address is required.');
        return;
    }
    if (cnft.mintToCollection && !cnft.collectionAddress) {
        addNotification('error', 'Collection NFT address is required when minting to a collection.');
        return;
    }
    
    const metadataUri = cnft.metadataUrl;
    if (!metadataUri) {
        addNotification('error', 'Metadata URL is required.');
        return;
    }

    try {
        dispatch({ type: 'MINT_CNFT_START' });

        let leafOwner: PublicKey | undefined;
        if (cnft.mintToDifferentWallet && cnft.recipientAddress) {
            try {
                leafOwner = new PublicKey(cnft.recipientAddress);
            } catch {
                addNotification('error', 'Invalid recipient address for cNFT.');
                dispatch({ type: 'MINT_CNFT_FAILURE' });
                return;
            }
        }
        
        const mintMethod = cnft.mintToCollection ? mintToCollectionV1 : mintV1;
        
        const tx = mintMethod(umi, {
            leafOwner: leafOwner ? publicKey(leafOwner) : umi.identity.publicKey,
            merkleTree: publicKey(cnft.treeAddress),
            collectionMint: cnft.mintToCollection ? publicKey(cnft.collectionAddress) : undefined,
            metadata: {
                name: cnft.name,
                symbol: cnft.symbol,
                uri: metadataUri,
                sellerFeeBasisPoints: percentAmount(0),
                collection: cnft.mintToCollection 
                    ? some({ key: publicKey(cnft.collectionAddress), verified: false }) 
                    : none(),
                creators: [{ address: umi.identity.publicKey, verified: true, share: 100 }],
            },
        } as any);

        const { signature } = await tx.sendAndConfirm(umi);
        const txId = base58.deserialize(signature)[0];

        dispatch({ type: 'MINT_CNFT_SUCCESS' });
        
        const newHistoryItem: MintedNft = {
          id: txId,
          name: cnft.name,
          type: 'cNFT',
          transactionId: txId,
          cluster: getClusterFromUrl(state.rpc.url),
          metadataUrl: metadataUri,
          collectionAddress: cnft.mintToCollection ? cnft.collectionAddress : undefined,
        };
        dispatch({ type: 'ADD_TO_HISTORY', payload: newHistoryItem });

        addNotification('success', 'cNFT minted successfully!', 
          <ExplorerLink signature={txId} cluster={getClusterFromUrl(state.rpc.url)} />);

    } catch (e) {
        dispatch({ type: 'MINT_CNFT_FAILURE' });
        addNotification('error', 'Failed to mint cNFT.', getErrorMessage(e));
    }
  }, [umi, state.cnft, state.rpc.url, addNotification]);

  const handleCopy = useCallback((text: string, message: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    addNotification('info', message);
  }, [addNotification]);

  const executeSave = useCallback((overwrite: boolean) => {
    try {
        const db: DatabaseFile = {
            rpcUrl: state.rpc.url,
            treeAddress: state.tree.address ? state.tree.address.toBase58() : null,
            mintHistory: state.mintHistory,
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
        
        const getTimestamp = () => {
            const d = new Date();
            const YYYY = d.getFullYear();
            const MM = (d.getMonth() + 1).toString().padStart(2, '0');
            const DD = d.getDate().toString().padStart(2, '0');
            const hh = d.getHours().toString().padStart(2, '0');
            const mm = d.getMinutes().toString().padStart(2, '0');
            const ss = d.getSeconds().toString().padStart(2, '0');
            return `${YYYY}${MM}${DD}-${hh}${mm}${ss}`;
        };

        const filename = overwrite ? 'AdvancedMint.json' : `AdvancedMint-${getTimestamp()}.json`;

        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        addNotification('success', 'Database file saved successfully!');
    } catch (error) {
        addNotification('error', 'Could not save database file.', getErrorMessage(error));
    }
  }, [state.rpc.url, state.tree.address, state.mintHistory, addNotification]);

  const handleSaveDatabase = useCallback(() => {
    setIsSaveModalOpen(true);
  }, []);

  const handleLoadDatabase = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File content is not a string.");
        }
        const parsedDb = JSON.parse(text);

        // A simple check to see if it's likely our file.
        if (typeof parsedDb !== 'object' || parsedDb === null || (!parsedDb.rpcUrl && !parsedDb.treeAddress && !parsedDb.mintHistory)) {
             throw new Error("Invalid database file format. Does not contain expected data.");
        }
        
        // Construct a valid DatabaseFile, providing defaults for missing keys from older versions.
        const db: DatabaseFile = {
            rpcUrl: parsedDb.rpcUrl || initialState.rpc.url,
            treeAddress: parsedDb.treeAddress || null,
            mintHistory: Array.isArray(parsedDb.mintHistory) ? parsedDb.mintHistory : [],
        };

        dispatch({ type: 'LOAD_DATABASE', payload: db });
        addNotification('success', 'Database loaded successfully!', 'RPC endpoint will need to be re-verified.');
      } catch (error) {
        addNotification('error', 'Failed to load database. File may be corrupt or invalid.', getErrorMessage(error));
      }
    };
    reader.readAsText(file);
  }, [addNotification]);

  const handleSelectHistoryItem = useCallback((item: MintedNft) => {
    if (item.type === 'Merkle Tree') {
        if (!item.address) return;
        dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'treeAddress', value: item.address } });
        addNotification('info', 'Merkle Tree address selected for cNFT minting.');
    } else if (item.type === 'Parent NFT' || item.type === 'NFT') {
        if (!item.address) return;

        dispatch({ type: 'SET_ALL_PARENT_NFT_FORM_FIELDS', payload: { address: null } });

        if (item.metadataUrl) {
            handleFetchParentMetadata(item.metadataUrl);
        }
        if (item.isCollection) {
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'mintToCollection', value: true } });
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'collectionAddress', value: item.address } });
        } else {
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'mintToCollection', value: false } });
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'collectionAddress', value: '' } });
        }
    } else if (item.type === 'cNFT') {
        if (!item.metadataUrl) {
            addNotification('error', 'No metadata URL found for this cNFT in history.');
            return;
        }
        dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'metadataUrl', value: item.metadataUrl } });
        if (item.collectionAddress) {
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'mintToCollection', value: true } });
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'collectionAddress', value: item.collectionAddress } });
        } else {
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'mintToCollection', value: false } });
            dispatch({ type: 'SET_CNFT_FORM', payload: { field: 'collectionAddress', value: '' } });
        }
        handleFetchCnftMetadata(item.metadataUrl);
        addNotification('info', 'cNFT data loaded for preview.');
    }
  }, [addNotification, handleFetchParentMetadata, handleFetchCnftMetadata]);

  const handleDisconnectAndReset = useCallback(async () => {
    // Always attempt to disconnect to fully reset the wallet adapter's state.
    // This is important for handling cases where the wallet connection is stuck,
    // or when the UI needs a hard reset even if the wallet isn't formally 'connected'.
    try {
      // Calling `disconnect` is safe even if the wallet is not connected.
      await wallet.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', getErrorMessage(error));
      // Still proceed to reset app state, as the user expects a reset.
    }

    // Dispatch an action to reset the application's state to its initial configuration.
    dispatch({ type: 'RESET_APP_STATE' });
    addNotification('info', 'Session Reset', 'The application state and wallet connection have been cleared.');
  }, [wallet, addNotification]);

  // Conditionally render a blocker for mobile devices.
  // Moved here after all hook calls to respect the Rules of Hooks.
  if (isMobile) {
    return (
      <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4 text-center">
        <DesktopComputerIcon className="w-24 h-24 text-indigo-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
            Desktop Experience Required
        </h1>
        <p className="text-gray-300 max-w-md">
            The Solana Advanced NFT Dashboard (S.A.N.D) is a resource-intensive application designed for a desktop environment.
        </p>
        <p className="text-gray-400 mt-4 text-sm">
            For full functionality, performance, and the best user experience, please access this site on a desktop or laptop computer.
        </p>
      </div>
    );
  }

  const contextValue: AppContextType = {
    state,
    dispatch,
    umi,
    addNotification,
    handleVerifyRpc,
    handleAirdrop,
    handleCreateTree,
    handleResetTree,
    handleFetchParentMetadata,
    handleGenerateParentMetadata,
    handleHideMetadataViewer,
    handleMintParentNft,
    handleResetParentNft,
    handleFetchCnftMetadata,
    handleMintCnft,
    handleCopy,
    handleSaveDatabase,
    handleLoadDatabase,
    handleSelectHistoryItem,
    handleDisconnectAndReset,
  };

  const nftPreviewCollectionAddress = state.parentNft.isCollection
    ? (state.parentNft.address?.toBase58() || state.cnft.collectionAddress)
    : undefined;

  const topGridClasses = state.rpc.verified
    ? "grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6"
    : "flex-grow flex justify-center items-center";

  return (
    <AppContext.Provider value={contextValue}>
      <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
        <NotificationProvider notifications={notifications} removeNotification={removeNotification} />
        {state.parentNft.showMetadataViewer && state.parentNft.generatedJson && (
          <MetadataViewer
            json={state.parentNft.generatedJson}
            onClose={handleHideMetadataViewer}
            onCopy={() => handleCopy(state.parentNft.generatedJson || '', 'Metadata JSON copied!')}
          />
        )}
        <SaveModal 
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            onSave={executeSave}
        />
        <Header />
        
        <main className="container mx-auto p-4 lg:p-8 flex-grow flex flex-col">
            <div className={topGridClasses}>
                <div className={`${!state.rpc.verified ? 'w-full max-w-md animate-fade-in' : ''}`}>
                  <RpcConfigCard />
                </div>
                
                {state.rpc.verified && (
                    <React.Fragment>
                        <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
                            <TreeManagementCard />
                        </div>
                        <div className="animate-fade-in" style={{animationDelay: '200ms'}}>
                            <ParentNftCard />
                        </div>
                        <div className="animate-fade-in" style={{animationDelay: '300ms'}}>
                            <CnftMintingCard />
                        </div>
                    </React.Fragment>
                )}
            </div>
            
            {state.rpc.verified && (
                 <>
                    <div className="animate-fade-in" style={{animationDelay: '400ms'}}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <ImagePreviewCard 
                                title="NFT Image Preview" 
                                imageUrl={state.parentNft.imageUrl}
                                loading={state.parentNft.fetchingMetadata}
                                nftType={state.parentNft.isCollection ? 'Collection' : 'Regular'}
                                collectionAddress={nftPreviewCollectionAddress}
                                onCopy={handleCopy}
                            />
                             <ImagePreviewCard 
                                title="cNFT Image Preview" 
                                imageUrl={state.cnft.imageUrl}
                                loading={state.cnft.fetchingMetadata}
                                nftType={state.cnft.mintToCollection ? 'Collection' : 'Standalone'}
                            />
                        </div>
                        <MintHistory />
                    </div>
                 </>
            )}
        </main>

        <ArdriveUploader />
      </div>
    </AppContext.Provider>
  );
};

export default App;