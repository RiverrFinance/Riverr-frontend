import { HttpAgent } from "@dfinity/agent";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import { parseUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import {
  StakeDetails,
  StakeSpan,
} from "../../utils/declarations/vault/vault.did";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../utils/declarations/token";

export default function ManageStaking() {
  const readWriteAgent = useAgent();
  const { user } = useAuth();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedAsset, setSelectedAsset] = useState(assetList[0]);
  const [referenceAmount, setReferenceAmount] = useState<string>("");
  const [stakeSpan, setStakeSpan] = useState<StakeSpan>();
  const [userBalance, setBalance] = useState<bigint>(0n);
  const [error, setError] = useState<"" | "Insufficient Balance">("");

  const [userPositions, setUserPositions] = useState<
    Array<[bigint, StakeDetails]>
  >([]);
  const [txDone, setTxDone] = useState(false);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (readWriteAgent) {
      fetchSetUserBalance;
      interval = setInterval(() => {
        fetchSetUserBalance();
      }, 10000);
    } else {
      setBalance(0n);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  useEffect(() => {
    let interval: number | undefined;
    if (readWriteAgent) {
      fetchSetUserPositions();
      interval = setInterval(() => {
        fetchSetUserPositions();
      }, 10000);
    } else {
      setUserPositions([]);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent, txDone]);

  const onAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const onAmountChange = (value: string) => {
    setReferenceAmount(value);
    if (value == "") {
      setError("");
    } else {
      const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
      if (amount > userBalance) {
        setError("Insufficient Balance");
      } else {
        setError("");
      }
    }
  };

  // Canister Interactions

  const fetchSetUserBalance = async () => {
    const { vTokenCanisterID } = selectedAsset;
    try {
      const vaultActor = new TokenActor(vTokenCanisterID, readAgent);
      const balance = await vaultActor.balance(user.principal);
      setBalance(balance);
    } catch {
      return;
    }
  };

  const fetchSetUserPositions = async () => {
    const { vaultID } = selectedAsset;
    try {
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const positions = await vaultActor.getUserStakes(user.principal);
      setUserPositions(userPositions);
    } catch {}
  };

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID } = selectedAsset;

    let tokenActor = new TokenActor(
      selectedAsset.vTokenCanisterID,
      readWriteAgent
    );

    return await tokenActor.approveSpending(
      approvalAmount,
      Principal.fromText(vaultID)
    );
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID, canisterID } = selectedAsset;
    let tokenActor = new TokenActor(canisterID, readAgent);

    return tokenActor.allowance(user.principal, Principal.fromText(vaultID));
  };

  const stakeVirtaulTokens = async () => {
    const { vaultID } = selectedAsset;
    try {
      const allowance = await getCurrentAllowance();
      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();

      if (allowance < amount) {
        // setCurrentAction("Appoving");
        let response = await approveSpending(amount - allowance);
        if (!response) {
          //  setTxError("Approval failed");
          setTxDone(true);
          return;
        }
      }
      const vaultActor = new VaultActor(vaultID, readWriteAgent);

      const txResult = await vaultActor.stakeVirtualTokens(amount, stakeSpan);
      //  setUserPositions(userPositions);
    } catch {}
  };

  const unStakeVirtulTokens = async (id: bigint) => {
    let { vaultID } = selectedAsset;

    try {
      let vaultactor = new VaultActor(vaultID, readWriteAgent);
      let txResult = await vaultactor.unstakeVirtualToken(id);
    } catch {}
  };

  return <div>ManageStaking</div>;
}
