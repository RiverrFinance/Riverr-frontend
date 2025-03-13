import {AuthClient} from "."
import {HttpAgent} from "@dfinity/agent";

export enum WalletError {
  USER_REJECTED = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
  ALREADY_PROCESSING = -32002,
}



const ERROR_MESSAGES: Record<number, string> = {
  [WalletError.USER_REJECTED]: 'Connection rejected! Please try again.',
  [WalletError.UNAUTHORIZED]: 'Wallet connection unauthorized.',
  [WalletError.UNSUPPORTED_METHOD]: 'Wallet method not supported.',
  [WalletError.DISCONNECTED]: 'Wallet disconnected.',
  [WalletError.CHAIN_DISCONNECTED]: 'Chain disconnected! Please try again.',
  [WalletError.ALREADY_PROCESSING]: 'Connection already in progress. Check MetaMask.',
};

export const getWalletErrorMessage = (error: any): string => {
  const code = error?.code || error?.error?.code;
  
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  
  if (error?.message?.includes('User rejected')) {
    return ERROR_MESSAGES[WalletError.USER_REJECTED];
  }
  
  return 'Failed to connect. Please try again.';
}; 