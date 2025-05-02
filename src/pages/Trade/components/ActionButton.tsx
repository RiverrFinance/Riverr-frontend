import { ConnectWallet, useAgent } from "@nfid/identitykit/react";
import { InputError } from "../types/trading";
import { Icon } from "semantic-ui-react";
import { Principal } from "@dfinity/principal";
import { Agent } from "@dfinity/agent";

interface Props {
  currentError: InputError;
  onClick: () => void;
}

export default function ActionButton({ currentError, onClick }: Props) {
  const readWriteAgent = useAgent();
  const onClickAction = () => {
    if (currentError == "") {
      onClick();
    }
  };
  return (
    <div className="flex flex-col justify-items-center">
      {readWriteAgent ? (
        <button
          type="button"
          className="bg-[#0300AD] rounded-md flex justify-center items-center gap-2 px-5 py-3 w-full cursor-pointer"
          onClick={onClickAction}
        >
          <span className="text-center font-semibold text-[13px]">
            Open Order
          </span>
        </button>
      ) : (
        <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-center items-center gap-2 px-5 py-0 w-full">
          <div className="inline-flex items-center justify-center gap-2">
            <Icon name="google wallet" />
            <ConnectWallet />
          </div>
        </div>
      )}
    </div>
  );
}
