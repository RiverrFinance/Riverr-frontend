import { HttpAgent } from "@dfinity/agent";
import { useAgent } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { Asset } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { parseUnits } from "ethers/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  marginBalance: string;
}

export default function WithdrawPopUp({ asset, isOpen, onClose }: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync);
  const [userMarginBalance, setUserMarginBalance] = useState<bigint>(0n);
  const [withdrawAmount, setWithdrawAmount] = useState<string>();
  const [error, setError] = useState<
    "" | "Insufficient Balance" | "Amount too Small"
  >("");

  if (!isOpen) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-[#18191D] p-6 rounded-md">
      {/* <h2 className="text-lg font-semibold mb-4">Withdraw {assetName ? assetName : 'Asset'}</h2> */}
      <p className="mb-4">This is a demo withdraw modal.</p>
      {/* Add your withdraw form elements here */}
      <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
        Close
      </button>
    </div>
  </div>
  );
}
