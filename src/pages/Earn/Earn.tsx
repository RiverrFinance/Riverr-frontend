import { useAgent, useAuth } from "@nfid/identitykit/react";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { Asset, assetList } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import React, { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { parseUnits } from "ethers/lib/utils";

export const Earn = () => {
  const readWriteAgent = useAgent();
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState(assetList[0]);

  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [amounToProvide, setAmountToProvide] = useState<string>("");
  const [useMarginBalance, setUsermarginBalance] = useState<bigint>(0n);

  const fetchSetUserMarginBalance = async () => {
    const { vaultID } = selectedAsset;
    try {
      //1\ const amount = parseUnits(amounToProvide, selectedAsset.decimals).toBigInt();

      const vaultActor = new VaultActor(vaultID, readAgent);
      const balance = await vaultActor.userMarginBalance(user.principal);
      setUsermarginBalance(balance);
    } catch {
      return;
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    if (readWriteAgent) {
      fetchSetUserMarginBalance;
      interval = setInterval(() => {
        fetchSetUserMarginBalance;
      }, 10000);
    } else {
      setUsermarginBalance(0n);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  const onAmountChange = (value: string) => {
    setAmountToProvide(value);
    if (value == "") {
    } else {
    }
  };

  const provideLiquidity = async () => {
    const { vaultID } = selectedAsset;
    try {
      const amount = parseUnits(
        amounToProvide,
        selectedAsset.decimals
      ).toBigInt();

      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const txResult: boolean = await vaultActor.provideLeverage(amount);
    } catch {
      return;
    }
  };

  const removeLiquidity = async () => {
    const { vaultID } = selectedAsset;
    try {
      const amount = parseUnits(
        amounToProvide,
        selectedAsset.decimals
      ).toBigInt();

      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const txResult = await vaultActor.removeLeverage(amount);
    } catch {
      return;
    }
  };

  const stakeVirtualTokens = async () => {
    const { vaultID } = selectedAsset;
    try {
      const amount = parseUnits(
        amounToProvide,
        selectedAsset.decimals
      ).toBigInt();

      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const txResult: boolean = await vaultActor.stakeVirtualTokens(amount, {
        Instant: null,
      });
    } catch {}
  };

  const unStakeVirtualTokens = async () => {
    const { vaultID } = selectedAsset;
    try {
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const txResult: boolean = await vaultActor.unstakeVirtualToken(0n);
    } catch {
      return;
    }
  };

  const fetcheVaultDetails = async () => {
    const { vaultID } = selectedAsset;
    try {
      const vaultActor = new VaultActor(vaultID, readAgent);

      const { free_liquidity, lifetime_fees } =
        await vaultActor.getVaultStakingDetails();
      //  const txResult:boolean = await vaultActor.provideLeverage(amount);
    } catch {
      return;
    }
  };

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Earn</h1> []
    </div>
  );
};
