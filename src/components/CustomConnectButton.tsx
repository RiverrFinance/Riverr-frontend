import React, { useState } from "react";

type CustomConnectButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
  };

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  onClick,
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-r from-[#0300AD] to-[#19195c] hover:from-[#02007a] hover:to-[#16213e] shadow-lg hover:shadow-xl border border-[#0300AD]/30 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={loading || disabled}
      // aria-busy={!!loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <span className="w-2 h-2 bg-white rounded-full"></span>
      )}
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};

type CustomConnectedButtonProps = {
  connectedAccount?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDisconnect?: () => void;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const CustomConnectedButton: React.FC<CustomConnectedButtonProps> = ({
  connectedAccount,
  onClick,
  onDisconnect,
  loading = false,
  disabled,
  ...props
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncatedAccount = connectedAccount
    ? `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`
    : "Connected";

  const truncatedPrincipal = connectedAccount
    ? `${connectedAccount.slice(0, 12)}...${connectedAccount.slice(-8)}`
    : "";

  const handleCopy = () => {
    if (connectedAccount) {
      navigator.clipboard.writeText(connectedAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setDropdownOpen((open) => !open)}
        className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed border border-[#0300AD]/30 shadow-lg hover:shadow-xl"
        disabled={loading || disabled}
        // aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
        )}
        <div className="w-2 h-2 bg-[#00ad00] rounded-full animate-pulse" />
        {loading ? "Connecting..." : truncatedAccount}
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-lg bg-[#0a1022e3] z-50 backdrop-blur-lg">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1C1C28]/40 border border-[#363c52]/30">
                <span className="font-mono text-sm text-gray-300">
                  {truncatedPrincipal}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-[#363c52]/30 rounded-md transition-colors"
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-400 hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onDisconnect) onDisconnect();
              }}
              className="mt-2 px-4 py-2.5 rounded-lg bg-[#7b0707]/30 hover:bg-[#523636]/60 text-white text-sm font-semibold transition-all duration-300 border border-[#363c52]/30 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Function to display user principal when connected
export const displayUserPrincipal = (userPrincipal: string) => {
  return CustomConnectedButton({
    connectedAccount: userPrincipal,
  });
};
