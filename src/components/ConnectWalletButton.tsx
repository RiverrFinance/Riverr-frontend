import { useState } from "react";

import { AuthClient } from "@dfinity/auth-client";

import { Principal } from "@dfinity/principal";

import { Identity } from "@dfinity/agent";

export interface ConnectWalletButtonProps {
  Identity: Identity | null;
  setIdentity: (Identity: Identity) => void;
  isConnected: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  setIdentity: onConnect,
}) => {
  let internet_identity_url = "";

  const [principal, setPrincipal] = useState<Principal>(Principal.anonymous());

  let authClient: AuthClient;

  const connectWallet = async () => {
    authClient = await AuthClient.create();

    if (await authClient.isAuthenticated()) {
      authClient.logout();
    }
    // start the login process and wait for it to finish
    await new Promise((resolve) => {
      authClient.login({
        identityProvider: internet_identity_url,
        onSuccess: resolve,
      });
    });

    let identity = authClient.getIdentity();

    let id = identity.getPrincipal();

    setPrincipal(id);

    onConnect(identity);
  };

  // const disconnectWallet = async () => {
  //    if (await authClient.isAuthenticated()){
  //         authClient.logout()
  //    }
  // };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return <div onClick={connectWallet}>{principal.toString()}</div>;
};
