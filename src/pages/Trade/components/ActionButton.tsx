import {
  ConnectedWalletButton,
  ConnectWallet,
  ConnectWalletButtonProps,
  useAgent,
} from "@nfid/identitykit/react";
import React, { HTMLProps } from "react";
import { InputError } from "../types/trading";

interface Props {
  currentError: InputError;
  onClick: () => void;
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
      {!readwrietAgent ? (
        <ConnectWallet />
      ) : (
        <button onClick={onClickAction}>Open Order</button>
      )}
    </div>
  );
}
