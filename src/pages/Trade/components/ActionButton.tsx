import { ConnectWallet, useAgent } from "@nfid/identitykit/react";
import { InputError } from "../types/trading";
import { Icon } from "semantic-ui-react";
import { Principal } from "@dfinity/principal";
import { Agent } from "@dfinity/agent";

interface Props {
  currentError: InputError;
  onClick: () => void;
  readWriteAgent?: Agent | undefined;
}

export default function ActionButton({ currentError, onClick }: Props) {
  const readwrietAgent = useAgent();

  const onClickAction = () => {
    if (currentError == "") {
      onClick();
    }
  };
  return (
    <div>
      {readwrietAgent == undefined ? (
        <div className="bg-[#0300AD] rounded-md flex justify-items-center items-center gap-2 px-5 cursor-pointer">
          <Icon name="google wallet" />
          <ConnectWallet />
        </div>
      ) : (
        <button type="button" onClick={onClickAction}>
          Open Order
        </button>
      )}
    </div>
  );
}
