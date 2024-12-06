import React from 'react';

export const ConnectWalletButton = () => {
  return (
    <button type='button' 
      className="bg-[#0D0C52] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1A1945] transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2"/>
        <path d="M16 12h.01" strokeWidth="3"/>
      </svg>
      <span>Connect Wallet</span>
    </button>
  );
}; 