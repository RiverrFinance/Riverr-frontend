import { useState } from "react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { BitcoinConnectModal } from "./BitcoinConnectModal";
import { toast } from "sonner";
import { Icon } from "semantic-ui-react";

const BTC_IMAGE_URL = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1696501408";

export const ConnectBTCWalletButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { address, connected, disconnect } = useLaserEyes();

  const handleConnect = () => {
    if (!connected) {
      setModalOpen(true);
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      toast.success("Wallet disconnected successfully", {
        duration: 3000
      });
      setShowDropdown(false);
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect wallet", {
        description: error?.message || "Disconnect failed",
        duration: 3000
      });
    }
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={handleConnect}
          className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex items-center gap-2 px-4 py-4 cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
        >
          <img src={BTC_IMAGE_URL} alt="BTC" className="w-6 h-6 rounded-full" />
          <span className="text-base font-semibold text-white">
            {connected
              ? address.slice(0, 6) + "..." + address.slice(-4)
              : "Connect Bitcoin"}
          </span>
          {connected && (
            <Icon name="chevron down" size="small" className="text-white ml-1" />
          )}
        </button>

        {/* Dropdown for connected wallet */}
        {connected && showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1b23] border border-[#363c52] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-[#363c52]/50">
              <div className="flex items-center gap-2">
                <img src={BTC_IMAGE_URL} alt="BTC" className="w-5 h-5 rounded-full" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </span>
                  <span className="text-xs text-gray-400">Connected</span>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full p-3 text-left hover:bg-[#363c52]/30 transition-colors duration-200 flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <Icon name="sign out" size="small" />
              <span className="text-sm">Disconnect</span>
            </button>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      <BitcoinConnectModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};