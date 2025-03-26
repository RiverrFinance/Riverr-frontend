import { HttpAgent } from "@dfinity/agent";
import { useAgent } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { Asset } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { parseUnits } from "ethers/lib/utils";

interface Props {
  asset: Asset;
  marginBalance: string;
}

export default function WIthdrawPopUp({ asset }: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync);
  const [userMarginBalance, setUserMarginBalance] = useState<bigint>(0n);
  const [withdrawAmount, setWithdrawAmount] = useState<string>();
  const [error, setError] = useState<
    "" | "Insufficient Balance" | "Amount too Small"
  >("");

  const withdrawFromAccount = async () => {
    try {
      if (readWriteAgent && withdrawAmount != "") {
        const user = await readWriteAgent.getPrincipal();
        const vaultActor = new VaultActor(asset.canisterID, readAgent);
        const amount = parseUnits(withdrawAmount, asset.decimals);
        let txResult = await vaultActor.withdrawfromAccount(
          amount.toBigInt(),
          user
        );
      }
    } catch {}
  };

  const onAmountChange = (value: string) => {
    if (value == "") {
      setError("");
    } else {
      let amount = parseUnits(value, asset.decimals).toBigInt();
      if (amount > userMarginBalance) {
        setError("Insufficient Balance");
      } else {
        setError("");
      }
    }
    setWithdrawAmount(value);
  };

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  return <div>WIthdrawPopUp</div>;
}
