import { useAuth } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { Icon } from "semantic-ui-react";
import { TransactionModal } from "./TransactionModal";
import { ConnectWallet } from "@nfid/identitykit/react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface Props {
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  selectedAsset: Asset;
}

export default function ManageLeverage({
  readWriteAgent,
  readAgent,
  selectedAsset,
}: Props) {
  const { user } = useAuth();
  const [referenceAmount, setReferenceAmount] = useState<string>("");
  const [useMarginBalance, setUsermarginBalance] = useState<bigint>(0n);
  const [usevTokenBalance, setVTokenBalance] = useState<bigint>(0n);
  const [activeTab, setActiveTab] = useState<"Deposit" | "Withdraw">("Deposit");
  const [error, setError] = useState<"Insufficient Balance" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "Approving..." | "Processing..." | null
  >(null);

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
  }, [readWriteAgent, selectedAsset]);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTxError(null);
  };

  const onAmountDepositChange = (value: string) => {
    if (Number(value) < 0) return;
    setReferenceAmount(value);
    if (value === "") {
      setError(null);
    } else {
      const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
      if (amount > useMarginBalance) {
        setError("Insufficient Balance");
      } else {
        setError(null);
      }
    }
  };

  const onAmountWithdrawChange = (value: string) => {
    if (Number(value) < 0) return;
    setReferenceAmount(value);
    if (value === "") {
      setError(null);
    } else {
      const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
      if (amount > usevTokenBalance) {
        setError("Insufficient Balance");
      } else {
        setError(null);
      }
    }
    ``;
  };

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
      return;
    }
  };

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;

    let tokenActor = new TokenActor(vTokenCanisterID, readWriteAgent);

    try {
      return await tokenActor.approveSpending(
        approvalAmount,
        Principal.fromText(vaultID)
      );
    } catch {
      return false;
    }
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;

    let tokenActor = new TokenActor(vTokenCanisterID, readAgent);

    try {
      return await tokenActor.allowance(
        user.principal,
        Principal.fromText(vaultID)
      );
    } catch (e) {
      return 0n;
    }
  };

  const provideLeverage = async () => {
    const { vaultID } = selectedAsset;

    setCurrentAction("Processing...");

    try {
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();
      const txResult: boolean = await vaultActor.provideLeverage(amount);

      if (!txResult) {
        setTxError("Transaction failed.");
      }
    } catch (e) {
      setTxError("An unknown error occurred.");
    } finally {
      setCurrentAction(null);
      setReferenceAmount("");
    }
  };

  const removeleverage = async () => {
    const { vaultID } = selectedAsset;

    setCurrentAction("Approving...");

    try {
      const allowance = await getCurrentAllowance();

      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();

      if (allowance < amount) {
        let response = await approveSpending(amount - allowance);
        if (!response) {
          setTxError("Approval failed.");
          setCurrentAction(null);
          return;
        }
      }

      setCurrentAction("Processing...");
      const vaultActor = new VaultActor(vaultID, readWriteAgent);

      const txResult: string = await vaultActor.removeLeverage(amount);
      if (txResult != "") {
        setTxError(txResult);
      }
    } catch (e) {
      setTxError("An unknown error occurred.");
    } finally {
      setCurrentAction(null);
      setReferenceAmount("");
    }
  };

  const handleSubmitTransaction = async () => {
    if (activeTab === "Deposit") {
      await provideLeverage();
    } else {
      await removeleverage();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-6 p-4 lg:p-6 bg-[#18191de9] rounded-xl border-2 border-dashed border-[#363c52] border-opacity-40 w-full">
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        <div className="flex relative bg-[#1C1C28] rounded-lg p-1">
          <div className="flex relative z-10 w-full">
            {(["Deposit", "Withdraw"] as const).map((tab) => (
              <button
                title="Select Tab"
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300 border-2 border-solid border-transparent"
              >
                <span
                  className={`relative z-10 ${
                    activeTab === tab
                      ? "text-white border-[#0300AD]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </span>
              </button>
            ))}
          </div>
          <div
            className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-2 border-solid border-[#0300AD] transition-transform duration-300 ease-in-out rounded-lg"
            style={{
              transform: `translateX(${
                activeTab === "Deposit" ? "0%" : "100%"
              })`,
            }}
          />
        </div>

        <div className="grid gap-4 lg:gap-6">
          <div className="space-y-2 lg:space-y-3">
            <label className="text-xs lg:text-sm font-medium text-gray-400">
              Amount
            </label>
            <div className="flex items-center bg-[#1C1C28] rounded-lg p-4 lg:p-4">
              <input
                type="text"
                className="flex-1 bg-transparent border-none focus:outline-none text-sm lg:text-base text-white w-full"
                placeholder="0.00"
                value={referenceAmount}
                onChange={(e) =>
                  activeTab === "Deposit"
                    ? onAmountDepositChange(e.target.value)
                    : onAmountWithdrawChange(e.target.value)
                }
                disabled={!readWriteAgent}
              />
              <div className="flex items-center gap-1 lg:gap-2 text-gray-400 text-sm lg:text-base">
                {selectedAsset.symbol}
                <Icon name="chevron down" className="text-xs lg:text-sm" />
              </div>
            </div>
            <p className="text-xs lg:text-sm text-gray-500">
              Available:{" "}
              {formatUnits(
                activeTab === "Deposit" ? useMarginBalance : usevTokenBalance,
                selectedAsset.decimals
              )}{" "}
              {activeTab === "Withdraw" ? "Q" : ""}
              {selectedAsset.symbol}
            </p>
            {error && (
              <p className="text-xs lg:text-sm text-red-500">{error}</p>
            )}
          </div>

          {readWriteAgent ? (
            <button
              type="button"
              onClick={handleModalOpen}
              disabled={referenceAmount == "" || error != null}
              className={`w-full py-3 lg:py-4 rounded-full text-sm lg:text-base font-medium transition-all duration-300 
              ${
                !error && referenceAmount != ""
                  ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                  : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
              }`}
            >
              {referenceAmount == "" ? "Enter Amount" : "Confirm"}
            </button>
          ) : (
            <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md p-1">
              <ConnectWallet />
            </div>
          )}
        </div>
        <TransactionModal
          isOpen={isModalOpen}
          onModalClose={handleModalClose}
          actionType={activeTab}
          asset={selectedAsset}
          amount={referenceAmount}
          onSubmitTransaction={handleSubmitTransaction}
          txError={txError}
          currentAction={currentAction}
        />
      </div>
    </div>
  );
}
