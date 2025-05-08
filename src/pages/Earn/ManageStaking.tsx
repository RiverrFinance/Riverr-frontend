import { HttpAgent, Agent } from "@dfinity/agent";
import { useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import {
  StakeDetails,
  StakeSpan,
} from "../../utils/declarations/vault/vault.did";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Principal } from "@dfinity/principal";
import { Icon } from "semantic-ui-react";
import { TransactionModal } from "./TransactionModal";
import { ConnectWallet } from "@nfid/identitykit/react";

interface Props {
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  selectedAsset: Asset;
}

export default function ManageStaking({
  readWriteAgent,
  readAgent,
  selectedAsset,
}: Props) {
  const { user } = useAuth();
  const [referenceAmount, setReferenceAmount] = useState<string>("");
  const [stakeSpan, setStakeSpan] = useState<StakeSpan>();
  const [userBalance, setBalance] = useState<bigint>(0n);
  const [error, setError] = useState<"Insufficient Balance" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [txError, setTxError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "Approving..." | "Processing..." | null
  >(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (readWriteAgent && readAgent) {
      fetchSetUserBalance();
      interval = setInterval(() => {
        fetchSetUserBalance();
      }, 10000);
    } else {
      setBalance(0n);
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

  const onAmountChange = (value: string) => {
    setReferenceAmount(value);
    if (value === "") {
      setError(null);
    } else {
      const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
      if (amount > userBalance) {
        setError("Insufficient Balance");
      } else {
        setError(null);
      }
    }
  };

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

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;

    let tokenActor = new TokenActor(vTokenCanisterID, readWriteAgent);

    try {
      return await tokenActor.approveSpending(
        approvalAmount,
        Principal.fromText(vaultID)
      );
    } catch (e) {
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

  const stakeVirtualTokens = async () => {
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
      const txResult = await vaultActor.stakeVirtualTokens(amount, stakeSpan);

      if (!txResult) {
        setTxError("Staking transaction failed");
      }
    } catch (e) {
      setTxError("An unknown error occurred.");
    } finally {
      setCurrentAction(null);
      setReferenceAmount("");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 bg-[#18191D] rounded-xl border-2 border-dashed border-[#363c52] border-opacity-40">
      {/* Tab Buttons */}
      <div className="flex relative bg-[#1C1C28] rounded-lg p-1">
        <div className="flex relative z-10 w-full">
          {/* {(["Stake", "Unstake"] as const).map((tab) => (
            <button
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
          ))} */}
        </div>
        {/* Sliding background with dotted border */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-2 border-dashed border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
          style={{
            transform: `translateX("0%")`,
          }}
        />
      </div>

      <div className="grid gap-6">
        {/* Amount Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-400">Amount</label>
          <div className="flex items-center bg-[#1C1C28] rounded-lg p-4">
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:outline-none text-white"
              placeholder="0.00"
              value={referenceAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={!readWriteAgent}
            />
            <div className="flex items-center gap-2">
              {selectedAsset.logoUrl && (
                <img
                  src={selectedAsset.logoUrl}
                  alt={selectedAsset.symbol}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="text-gray-400">Q{selectedAsset.symbol}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Available: {formatUnits(userBalance, selectedAsset.decimals)} Q
            {selectedAsset.symbol}
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Duration Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-400">Duration</label>
          <div className="flex items-center justify-between bg-[#1C1C28] rounded-lg p-4 text-gray-400">
            <span>Select Duration</span>
            <Icon name="chevron down" size="small" />
          </div>
        </div>

        {readWriteAgent ? (
          <button
            type="button"
            onClick={handleModalOpen}
            disabled={error != null || referenceAmount == ""}
            className={`w-full py-4 rounded-full font-medium transition-all duration-300 
                ${
                  !error && referenceAmount != ""
                    ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                    : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                }`}
          >
            {referenceAmount == "" ? "Enter Amount" : "Stake"}
          </button>
        ) : (
          <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-center items-center px-5 w-full">
            <ConnectWallet />
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onModalClose={handleModalClose}
        actionType={"Stake"}
        asset={selectedAsset}
        amount={referenceAmount}
        onSubmitTransaction={stakeVirtualTokens}
        txError={txError}
        currentAction={currentAction}
      />
    </div>
  );
}
