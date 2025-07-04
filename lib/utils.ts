
import { WalletError } from '@solana/wallet-adapter-base';

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

/**
 * A robust error message parser for Solana/Wallet/UMI errors.
 * Logs the full error for debugging purposes.
 * @param error The error object.
 * @returns A user-friendly error message string.
 */
export const getErrorMessage = (error: unknown): string => {
    // Log the full error to the console for easier debugging.
    console.error("Error processed by getErrorMessage:", error);

    // Handle specific wallet errors from @solana/wallet-adapter-base.
    if (error instanceof WalletError) {
        // User rejection is a common and specific case.
        if (error.message.includes('User rejected the request')) {
            return 'Transaction was rejected in your wallet.';
        }
        // For other wallet errors, the message is usually informative enough.
        return `Wallet Error: ${error.message}`;
    }

    // Handle standard JavaScript Error objects.
    if (error instanceof Error) {
        // Metaplex UMI often wraps the underlying error in a 'cause' property.
        if ('cause' in error && error.cause instanceof Error) {
            return error.cause.message;
        }

        // Catch rate-limiting errors (HTTP 429).
        if (error.message.includes('429')) {
            return 'Too many requests sent in a short period. Please wait a moment and try again.';
        }

        // For other generic errors, the message is the best we have.
        return error.message;
    }

    // Fallback for cases where the thrown object is not an Error instance.
    return String(error);
};
