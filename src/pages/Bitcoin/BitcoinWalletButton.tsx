import { useState } from "react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { BitcoinConnectModal } from "./BitcoinConnectModal"; 

const BTC_IMAGE_URL = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1696501408";


export const ConnectBTCWalletButton =  () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { address, connected } = useLaserEyes();

  const handleConnect = () => {
    if (!connected) {
      setModalOpen(true);
    }
  };

  return (
    <>
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
      </button>

      <BitcoinConnectModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

