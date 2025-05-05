import { useAgent, useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { VaultStakingDetails } from "../../utils/declarations/vault/vault.did";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { Icon } from "semantic-ui-react";

import { TransactionModal } from "./TransactionModal";

import { ConnectWallet } from "@nfid/identitykit/react";

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

  const [error, setError] = useState<
    "" | "Insufficient Balance" | "Invalid amount"
  >("");
  const [warning, setWarning] =
    useState<"Transaction might fail as Vault is not liquid enough">();
  const [txDone, setTxDone] = useState(false);
  const [activeTab, setActiveTab] = useState<"Deposit" | "Withdraw">("Deposit");
  const [duration, setDuration] = useState<string>("1 month");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "failure" | "in_progress" | null
  >(null);
  const [transactionMessage, setTransactionMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txError, setTxError] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<
    "Appoving" | "Transacting" | ""
  >("");

  const isWalletConnected = !!readWriteAgent;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWalletConnected) {
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
  }, [isWalletConnected, selectedAsset]);

  // current: Fetch vault staking details when txDone or selectedAsset changes

  /// Event handlers

  const onAmountDepositChange = (value: string) => {
    setReferenceAmount(value);
    if (value === "") {
      setError("");
    } else {
      try {
        const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
        if (amount > useMarginBalance) {
          setError("Insufficient Balance");
        } else {
          setError("");
        }
      } catch (e) {
        setError("Invalid amount");
      }
    }
  };

  const onAmountWithdrawChange = (value: string) => {
    setReferenceAmount(value);
    if (value === "") {
      setError("");
    } else {
      try {
        const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
        if (amount > usevTokenBalance) {
          setError("Insufficient Balance");
        } else {
          setError("");
        }
      } catch (e) {
        setError("Invalid amount");
      }
    }
  };

  /// Canister Interaction functions

  const fetchUserMarginBalance = async (): Promise<bigint> => {
    const { vaultID } = selectedAsset;
    if (!vaultID || !user?.principal) return 0n;

    const vaultActor = new VaultActor(vaultID, readAgent);
    return vaultActor.userMarginBalance(user.principal);
  };

  const fetchUserVtokenBalance = async (): Promise<bigint> => {
    const { vTokenCanisterID } = selectedAsset;
    if (!vTokenCanisterID || !user?.principal) return 0n;

    const tokenActor = new TokenActor(vTokenCanisterID, readAgent);
    return tokenActor.balance(user.principal);
  };

  const fetchSetBalances = async () => {
    if (!isWalletConnected) return;
    try {
      const [vbalance, mbalance] = await Promise.all([
        fetchUserVtokenBalance(),
        fetchUserMarginBalance(),
      ]);
      setVTokenBalance(vbalance);
      setUsermarginBalance(mbalance);
    } catch (e) {
      console.error("error fetching balances", e);
    }
  };

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;
    if (!vaultID || !vTokenCanisterID || !readWriteAgent) return false;

    let tokenActor = new TokenActor(vTokenCanisterID, readWriteAgent);

    try {
      return await tokenActor.approveSpending(
        approvalAmount,
        Principal.fromText(vaultID)
      );
    } catch (e) {
      console.error("Error approving spending:", e);
      setTxError(
        `Approval failed: ${e.message || "An unknown error occurred."}`
      );
      return false;
    }
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;
    if (!vaultID || !vTokenCanisterID || !user?.principal) return 0n;

    let tokenActor = new TokenActor(vTokenCanisterID, readAgent);

    try {
      return tokenActor.allowance(user.principal, Principal.fromText(vaultID));
    } catch (e) {
      console.error("Error getting current allowance:", e);
      return 0n;
    }
  };

  const provideLeverage = async () => {
    const { vaultID } = selectedAsset;
    if (!vaultID || !readWriteAgent) return;

    setIsLoading(true);
    setTxError("");
    setCurrentAction("Transacting");

    try {
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();
      const txResult: boolean = await vaultActor.provideLeverage(amount);

      if (txResult) {
        setTransactionStatus("success");
        setTransactionMessage("Leverage provided successfully!");
      } else {
        setTransactionStatus("failure");
        setTransactionMessage("Failed to provide leverage.");
        setTxError("Transaction failed.");
      }
      setTxDone((prev) => !prev);
    } catch (e) {
      console.error("Error providing leverage:", e);
      setTransactionStatus("failure");
      setTransactionMessage(
        `Error: ${e.message || "An unknown error occurred."}`
      );
      setTxError(`Error: ${e.message || "An unknown error occurred."}`);
      setTxDone((prev) => !prev);
    } finally {
      setIsLoading(false);
      setCurrentAction("");
    }
  };

  const removeleverage = async () => {
    const { vaultID, vTokenCanisterID } = selectedAsset;
    if (!vaultID || !vTokenCanisterID || !readWriteAgent) return;

    setIsLoading(true);
    setTxError("");
    setCurrentAction("Appoving");

    try {
      const allowance = await getCurrentAllowance();
      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();

      if (allowance < amount) {
        let response = await approveSpending(amount - allowance);

        if (!response) {
          console.error("Approval failed");
          setTransactionStatus("failure");
          setTransactionMessage("Approval failed.");
          setTxError("Approval failed.");
          setIsLoading(false);
          setCurrentAction("");
          setTxDone((prev) => !prev);
          return;
        }
      }

      setCurrentAction("Transacting");

      const txResult: string = await vaultActor.removeLeverage(amount);
      if (txResult === "") {
        setTransactionStatus("success");
        setTransactionMessage("Leverage removed successfully!");
      } else {
        console.error("Remove leverage failed:", txResult);
        setTransactionStatus("failure");
        setTransactionMessage(`Failed to remove leverage: ${txResult}`);
        setTxError(`Failed to remove leverage: ${txResult}`);
      }
      setTxDone((prev) => !prev);
    } catch (e) {
      console.error("Error removing leverage:", e);
      setTransactionStatus("failure");
      setTransactionMessage(
        `Error: ${e.message || "An unknown error occurred."}`
      );
      setTxError(`Error: ${e.message || "An unknown error occurred."}`);
      setTxDone((prev) => !prev);
    } finally {
      setIsLoading(false);
      setCurrentAction("");
    }
  };

  const handleConfirmClick = () => {
    if (!isWalletConnected) {
      console.log(
        "Connect wallet clicked - Handled by ConnectWallet component"
      );
      // The ConnectWallet component will handle the connection
      return;
    }

    if (error || referenceAmount === "") {
      console.log("Cannot confirm due to input error or empty amount");
      return;
    }

    setIsModalOpen(true);
    setTxError("");
    setTransactionStatus(null);
    setTransactionMessage("");
  };

  const handleSubmitTransaction = async () => {
    if (activeTab === "Deposit") {
      await provideLeverage();
    } else {
      await removeleverage();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 bg-[#18191de9] rounded-xl border-2 border-dashed border-[#363c52] border-opacity-40">
      {/* Tab Buttons */}
      <div className="flex relative bg-[#1C1C28] rounded-lg p-1">
        <div className="flex relative z-10 w-full">
          {(["Deposit", "Withdraw"] as const).map((tab) => (
            <button
              title="Select Tab"
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300 border-2 border-dashed border-transparent"
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
        {/* Sliding background with dotted border */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-2 border-dashed border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
          style={{
            transform: `translateX(${activeTab === "Deposit" ? "0%" : "100%"})`,
          }}
        />
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-400">Amount</label>
          <div className="flex items-center bg-[#1C1C28] rounded-lg p-4">
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:outline-none text-white"
              placeholder="0.00"
              value={referenceAmount}
              onChange={(e) =>
                activeTab === "Deposit"
                  ? onAmountDepositChange(e.target.value)
                  : onAmountWithdrawChange(e.target.value)
              }
              disabled={!readWriteAgent}
            />
            <div className="flex items-center gap-2 text-gray-400">
              {selectedAsset.symbol}
              <Icon name="chevron down" size="small" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Available:{" "}
            {formatUnits(
              activeTab === "Deposit" ? useMarginBalance : usevTokenBalance,
              selectedAsset.decimals
            )}{" "}
            {selectedAsset.symbol}
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {readWriteAgent ? (
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={!!error || !referenceAmount}
            className={`w-full py-4 rounded-full font-medium transition-all duration-300 
              ${
                !error && referenceAmount
                  ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                  : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
              }`}
          >
            {error || !referenceAmount ? "Enter Amount" : "Confirm"}
          </button>
        ) : (
          <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-center items-center px-5  w-full">
            <ConnectWallet />
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionType={activeTab}
        asset={selectedAsset}
        userBalance={
          activeTab === "Deposit" ? useMarginBalance : usevTokenBalance
        }
        amount={referenceAmount}
        error={error}
        onSubmitTransaction={handleSubmitTransaction}
        isLoading={isLoading}
        txError={txError}
        currentAction={currentAction}
      />
    </div>
  );
}
