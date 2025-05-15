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
          className="bg-[#0300AD] rounded-md flex justify-center items-center gap-2 px-5 py-3 w-full cursor-pointer"
          onClick={onClick}
        >
          <span className="text-center font-semibold text-[13px]">
            Open Order
          </span>
        </button>
      ) : (
        <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-center items-center gap-2 px-5 w-full">
          <ConnectWallet />
        </div>
      )}
    </div>
  );
}
