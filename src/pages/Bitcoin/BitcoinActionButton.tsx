import { ConnectWallet, useAgent, useAuth } from "@nfid/identitykit/react";
import { assetList } from "../../lists/marketlist";

interface Props {
  isConnected: boolean;
  onConnect: () => void;
  error: string | null;
  isICP?: boolean;
  token: string;
}

export function BitcoinActionButton({
  isConnected,
  onConnect,
  error,
  isICP = false,
  token,
}: Props) {
  const { user } = useAuth();
  const readWriteAgent = useAgent();

  if (isICP) {
    if (!user?.principal) {
      return (
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex justify-center items-center gap-3 px-6 py-2 !text-lg w-full cursor-pointer transition-all duration-300">
          <ConnectWallet />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={onConnect}
        disabled={!!error}
        className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex justify-center items-center gap-3 px-6 py-4 w-full cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
      >
        <span className="text-lg font-semibold text-white">
          {user?.principal ? "Confirm Exchange" : "Connect ICP Wallet"}
        </span>
      </button>
    );
  }

  // Bitcoin connect button 
  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={!!error}
      className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex items-center gap-2 px-4 py-4 cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
    >
      <img
        src={assetList[2].logoUrl}
        alt="BTC"
        className="w-6 h-6 rounded-full"
      />
      <span className="text-base font-semibold text-white">
        {isConnected ? "Connected" : "Connect Bitcoin"}
      </span>
    </button>
  );
}
