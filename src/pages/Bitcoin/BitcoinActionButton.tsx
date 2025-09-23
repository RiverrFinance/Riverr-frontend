import { ConnectWallet, useAgent, useAuth } from "@nfid/identitykit/react";
import { assetList } from "../../lists/marketlist";
import { useLaserEyes } from "@omnisat/lasereyes";

interface Props {
  handleConfirm: () => void;
  error: string | null;
}

export function BitcoinActionButton({ handleConfirm, error }: Props) {
  const { user } = useAuth();
  const { connected } = useLaserEyes();

  if (user === undefined) {
    return (
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex justify-center items-center gap-3 px-6 py-2 !text-lg w-full cursor-pointer transition-all duration-300">
        <ConnectWallet />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={!connected || error !== null}
      className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex justify-center items-center gap-3 px-6 py-4 w-full cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
    >
      <span className="text-lg font-semibold text-white">
        {connected
          ? error
            ? error
            : "Confirm Exchange"
          : "Connect BTC Wallet"}
      </span>
    </button>
  );

  // Bitcoin connect button
}
