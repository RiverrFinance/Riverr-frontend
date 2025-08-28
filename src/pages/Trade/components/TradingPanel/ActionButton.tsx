import { ConnectWallet, useAgent, useAuth } from "@nfid/identitykit/react";
import { InputError } from "../../types/trading";

interface Props {
  currentError: InputError;
  onClick: () => void;
}

export default function ActionButton({ currentError, onClick }: Props) {
  const { user } = useAuth();
  const readWriteAgent = useAgent();

  return (
    <div className="flex flex-col justify-items-center">
      {readWriteAgent ? (
        <button
          type="button"
          disabled={currentError != null}
          className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-xl flex justify-center items-center gap-3 px-6 py-4 w-full cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
          onClick={onClick}
        >
          <span className="text-center font-semibold text-sm text-white">
            Open Order
          </span>
        </button>
      ) : (
        <div className="bg-gradient-to-r from-[#0300AD] to-[#19195c] hover:from-[#02007a] hover:to-[#16213e] shadow-lg hover:shadow-xl border border-[#0300AD]/30 rounded-xl flex justify-center items-center gap-3 px-6 py-1 w-full cursor-pointer transition-all duration-300">
          <ConnectWallet />
        </div>
      )}
    </div>
  );
}
