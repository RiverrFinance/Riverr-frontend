import { useAgent } from "@nfid/identitykit/react";
import { Asset } from "../../lists/marketlist";
import { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { parseUnits } from "ethers/lib/utils";
const ICP_API_HOST = "https://icp-api.io/";

interface Props {
  asset: Asset;
}

export default function FundingPopUp({ asset }: Props) {
  const readWriteAgent = useAgent();
  const [userTokenBalance, setUserTokenBalance] = useState<bigint>(0n);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync);
  const [error, setError] = useState<
    "" | "Insufficient Balance" | "Amount too Small"
  >("");
  const [currentAction, setCurrentAction] = useState<
    "Appoving" | "Spending" | ""
  >("");

  const setUserBalance = async () => {
    try {
      if (readWriteAgent) {
        let user = await readWriteAgent.getPrincipal();
        let tokenActor = new TokenActor(asset.canisterID, readAgent);
        const balance = await tokenActor.balance(user);
        setUserTokenBalance(balance);
      }
    } catch (err) {}
  };

  const approveSpending = async (
    approvalAmount: bigint,
    expectedAmount: bigint
  ): Promise<boolean> => {
    let { vaultID } = asset;
    try {
      if (readWriteAgent && vaultID) {
        let tokenActor = new TokenActor(asset.canisterID, readWriteAgent);

        let txResult = await tokenActor.approveSpending(
          approvalAmount,
          expectedAmount,
          Principal.fromText(vaultID)
        );
        return txResult;
      }
    } catch {
      return false;
    }
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID } = asset;
    try {
      let user = await readWriteAgent.getPrincipal();
      let tokenActor = new TokenActor(asset.canisterID, readAgent);

      return await tokenActor.allowance(user, Principal.fromText(vaultID));
    } catch {
      return 0n;
    }
  };

  const fundAccount = async () => {
    let { vaultID } = asset;
    try {
      if (readWriteAgent && depositAmount != "" && vaultID) {
        let user = await readWriteAgent.getPrincipal();

        const allowance = await getCurrentAllowance();

        let amount = parseUnits(depositAmount, asset.decimals).toBigInt();

        if (allowance < amount) {
          setCurrentAction("Appoving");
          let response = await approveSpending(amount - allowance, amount);
          if (!response) {
            return;
          }
        }

        let vaultActor = new VaultActor(asset.vaultID, readWriteAgent);
        setCurrentAction("Spending");

        let txResult = await vaultActor.fundAccount(amount, user);
      }
    } catch (err) {}
  };

  const onAmountUpdate = async (value: string) => {
    if (value == "") {
      setError("");
    } else {
      const amount = parseUnits(value, asset.decimals);
      if (amount.toBigInt() > userTokenBalance) {
        setError("Insufficient Balance");
      } else {
        setError("");
      }
    }
    setDepositAmount(value);
  };

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
    const interval = setInterval(() => {
      setUserBalance();
    }, 6000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div>DepositPopUp</div>;
}
