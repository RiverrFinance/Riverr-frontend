import { useAgent, useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { parseUnits } from "ethers/lib/utils";
import { VaultStakingDetails } from "../../utils/declarations/vault/vault.did";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";

interface Props {
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
}

export default function ManageLeverage({ readWriteAgent, readAgent }: Props) {
  const { user } = useAuth();

  const [selectedAsset, setSelectedAsset] = useState(assetList[0]);
  const [referenceAmount, setReferenceAmount] = useState<string>("");
  const [useMarginBalance, setUsermarginBalance] = useState<bigint>(0n);
  const [usevTokenBalance, setVTokenBalance] = useState<bigint>(0n);
  const [vaultStakingDetails, setVaultStakingDetails] =
    useState<VaultStakingDetails>();
  const [error, setError] = useState<"" | "Insufficient Balance">("");
  const [warning, setWarning] =
    useState<"Transaction might fail as Vault is not liquid enough">();
  const [txDone, setTxDone] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (readWriteAgent) {
      fetchSetBalances();
      interval = setInterval(() => {
        fetchSetBalances();
      }, 10000); // ten seconds
    } else {
      setUsermarginBalance(0n);
      setVTokenBalance(0n);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  useEffect(() => {
    fetchSetVaultStakingDetails();
    const interval: NodeJS.Timeout = setInterval(() => {
      fetchSetVaultStakingDetails();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [txDone]);

  ///  Event handlers

  const onAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const onAmountDepositChange = (value: string) => {
    setReferenceAmount(value);
    if (value == "") {
      setError("");
    } else {
      const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
      if (amount > useMarginBalance) {
        setError("Insufficient Balance");
      } else {
        setError("");
      }
    }
  };

  const onAmountWithdrawChange = (value: string) => {
    setReferenceAmount(value);
    if (value == "") {
      setError("");
    } else {
      const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
      if (amount > usevTokenBalance) {
        setError("Insufficient Balance");
      } else {
        setError("");
      }
    }
  };

  /// Canister Inetraction functions

  const fetchUserMarginBalance = async (): Promise<bigint> => {
    const { vaultID } = selectedAsset;

    const vaultActor = new VaultActor(vaultID, readAgent);
    return vaultActor.userMarginBalance(user.principal);
  };

  const fetchUserVtokenBalance = async (): Promise<bigint> => {
    const { vTokenCanisterID } = selectedAsset;
    const tokenActor = new TokenActor(vTokenCanisterID, readAgent);

    return tokenActor.balance(user.principal);
  };

  const fetchSetBalances = async () => {
    try {
      const [vbalance, mbalance] = await Promise.all([
        fetchUserVtokenBalance(),
        fetchUserMarginBalance(),
      ]);
      setVTokenBalance(vbalance);
      setUsermarginBalance(mbalance);
    } catch {
      console.log("error fetching balances");
    }
  };

  const fetchSetVaultStakingDetails = async (): Promise<bigint> => {
    const { vaultID } = selectedAsset;
    try {
      const vaultActor = new VaultActor(vaultID, readAgent);
      const details = await vaultActor.getVaultStakingDetails();
      setVaultStakingDetails(details);
    } catch {
      return;
    }
  };

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;

    let tokenActor = new TokenActor(vTokenCanisterID, readWriteAgent);

    return tokenActor.approveSpending(
      approvalAmount,
      Principal.fromText(vaultID)
    );
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;
    let tokenActor = new TokenActor(vTokenCanisterID, readAgent);

    return tokenActor.allowance(user.principal, Principal.fromText(vaultID));
  };

  const provideLeverage = async () => {
    const { vaultID } = selectedAsset;
    try {
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();
      const txResult: boolean = await vaultActor.provideLeverage(amount);
    } catch {}
  };

  const removeleverage = async () => {
    const { vaultID, vTokenCanisterID } = selectedAsset;
    try {
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();

      const allowance = await getCurrentAllowance();

      if (allowance < amount) {
        let response = await approveSpending(amount - allowance);
      }

      const txResult: string = await vaultActor.removeLeverage(amount);
      if (txResult == "") {
      } else {
      }
    } catch {}
  };

  if (selectedAsset.vTokenCanisterID) {
    return <div>ManageLeverage</div>;
  } else {
    return;
  }
}
