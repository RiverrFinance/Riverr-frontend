import { HttpAgent, Agent } from "@dfinity/agent";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import {
  StakeDetails,
  StakeSpan,
} from "../../utils/declarations/vault/vault.did";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Principal } from "@dfinity/principal";
import { canisterId } from "../../utils/declarations/token";
import { Icon } from "semantic-ui-react";
import StakePositionComponent from "./PositionComponent";
import { TransactionModal } from "./TransactionModal";
import { ConnectWallet } from "@nfid/identitykit/react";

interface Props {
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  selectedAsset: Asset;
}

export default function ManageStaking({ readWriteAgent, readAgent, selectedAsset }: Props) {
  const { user } = useAuth();
  const [referenceAmount, setReferenceAmount] = useState<string>("");
  const [stakeSpan, setStakeSpan] = useState<StakeSpan>();
  const [userBalance, setBalance] = useState<bigint>(0n);
  const [error, setError] = useState<"" | "Insufficient Balance" | "Invalid amount">("");
  const [userPositions, setUserPositions] = useState<Array<[bigint, StakeDetails]>>([]);
  const [txDone, setTxDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'failure' | 'in_progress' | null>(null);
  const [transactionMessage, setTransactionMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [txError, setTxError] = useState<string>('');
  const [currentAction, setCurrentAction] = useState<'Appoving' | 'Transacting' | ''>('');
  const [activeTab, setActiveTab] = useState<"Stake" | "Unstake">("Stake");

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
  }, [readWriteAgent, selectedAsset, readAgent]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (readWriteAgent && readAgent) {
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
  }, [readWriteAgent, txDone, selectedAsset, readAgent]);

  const onAmountChange = (value: string) => {
    setReferenceAmount(value);
    if (value === "") {
      setError("");
    } else {
      try {
        const amount = parseUnits(value, selectedAsset.decimals).toBigInt();
        if (amount > userBalance) {
          setError("Insufficient Balance");
        } else {
          setError("");
        }
      } catch (e) {
        setError("Invalid amount");
      }
    }
  };

  const fetchSetUserBalance = async () => {
    const { vTokenCanisterID } = selectedAsset;
    if (!vTokenCanisterID || !user?.principal || !readAgent) return;

    try {
      const vaultActor = new TokenActor(vTokenCanisterID, readAgent);
      const balance = await vaultActor.balance(user.principal);
      setBalance(balance);
    } catch (e) {
      console.error("Error fetching user balance:", e);
    }
  };

  const fetchSetUserPositions = async () => {
    const { vaultID } = selectedAsset;
    if (!vaultID || !user?.principal || !readAgent) return;

    try {
      const agentToUse = readWriteAgent || readAgent;
      const vaultActor = new VaultActor(vaultID, agentToUse);
      const positions = await vaultActor.getUserStakes(user.principal);
      setUserPositions(positions);
    } catch (e) {
      console.error("Error fetching user positions:", e);
    }
  };

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID, vTokenCanisterID } = selectedAsset;
    if (!vaultID || !vTokenCanisterID || !readWriteAgent) return false;

    let tokenActor = new TokenActor(
      selectedAsset.vTokenCanisterID,
      readWriteAgent
    );

    try {
      return await tokenActor.approveSpending(
        approvalAmount,
        Principal.fromText(vaultID)
      );
    } catch (e) {
      console.error("Error approving spending:", e);
      setTxError(`Approval failed: ${e.message || 'An unknown error occurred.'}`);
      return false;
    }
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID, canisterID } = selectedAsset;
    if (!vaultID || !canisterID || !user?.principal || !readAgent) return 0n;

    let tokenActor = new TokenActor(canisterID, readAgent);

    try {
      return tokenActor.allowance(user.principal, Principal.fromText(vaultID));
    } catch (e) {
      console.error("Error getting current allowance:", e);
      return 0n;
    }
  };

  const stakeVirtaulTokens = async () => {
    const { vaultID } = selectedAsset;
    if (!vaultID || !readWriteAgent) return;

    setIsLoading(true);
    setTxError('');
    setCurrentAction('Appoving');

    try {
      const allowance = await getCurrentAllowance();

      if (allowance === 0n && !readAgent) {
        setTransactionStatus('failure');
        setTransactionMessage('Failed to get current allowance.');
        setTxError('Failed to get current allowance.');
        setIsLoading(false);
        setCurrentAction('');
        setTxDone(prev => !prev);
        return;
      }

      const amount = parseUnits(
        referenceAmount,
        selectedAsset.decimals
      ).toBigInt();

      if (allowance < amount) {
        let response = await approveSpending(amount - allowance);

        if (!response) {
          console.error("Approval failed");
          setTransactionStatus('failure');
          setTransactionMessage('Approval failed.');
          setTxError('Approval failed.');
          setIsLoading(false);
          setCurrentAction('');
          setTxDone(prev => !prev);
          return;
        }
      }

      setCurrentAction('Transacting');

      const vaultActor = new VaultActor(vaultID, readWriteAgent);
      const txResult = await vaultActor.stakeVirtualTokens(amount, stakeSpan);

      if (txResult) {
        setTransactionStatus('success');
        setTransactionMessage('Tokens staked successfully!');
      } else {
        setTransactionStatus('failure');
        setTransactionMessage('Failed to stake tokens.');
        setTxError('Staking transaction failed.');
      }

      setTxDone(true);
    } catch (e) {
      console.error("Error staking virtual tokens:", e);
      setTransactionStatus('failure');
      setTransactionMessage(`Error: ${e.message || 'An unknown error occurred.'}`);
      setTxError(`Error: ${e.message || 'An unknown error occurred.'}`);
      setTxDone(true);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const unStakeVirtulTokens = async (id: bigint) => {
    let { vaultID } = selectedAsset;
    if (!vaultID || !readWriteAgent) return;

    setIsLoading(true);
    setTxError('');
    setCurrentAction('Transacting');

    try {
      let vaultactor = new VaultActor(vaultID, readWriteAgent);
      let txResult = await vaultactor.unstakeVirtualToken(id);

      if (txResult) {
        setTransactionStatus('success');
        setTransactionMessage('Tokens unstaked successfully!');
      } else {
        setTransactionStatus('failure');
        setTransactionMessage('Failed to unstake tokens.');
        setTxError('Unstaking transaction failed.');
      }

      setTxDone(true);
    } catch (e) {
      console.error("Error unstaking virtual tokens:", e);
      setTransactionStatus('failure');
      setTransactionMessage(`Error: ${e.message || 'An unknown error occurred.'}`);
      setTxError(`Error: ${e.message || 'An unknown error occurred.'}`);
      setTxDone(true);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const handleStakeConfirmClick = () => {
    if (!readWriteAgent) {
      console.log("Connect wallet clicked - Handled by ConnectWallet component");
      return;
    }

    if (error || referenceAmount === "") {
      console.log("Cannot confirm due to input error or empty amount");
      return;
    }

    setIsModalOpen(true);
    setTxError('');
    setTransactionStatus(null);
    setTransactionMessage('');
  };

  const handleSubmitStakeTransaction = async () => {
    await stakeVirtaulTokens();
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 bg-[#18191D] rounded-xl border-2 border-dashed border-[#363c52] border-opacity-40">
      {/* Tab Buttons */}
      <div className="flex relative bg-[#1C1C28] rounded-lg p-1">
        <div className="flex relative z-10 w-full">
          {(["Stake", "Unstake"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300 border-2 border-dashed border-transparent"
            >
              <span className={`relative z-10 ${
                activeTab === tab 
                  ? 'text-white border-[#0300AD]' 
                  : 'text-gray-400 hover:text-white'
              }`}>
                {tab}
              </span>
            </button>
          ))}
        </div>
        {/* Sliding background with dotted border */}
        <div 
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-2 border-dashed border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
          style={{
            transform: `translateX(${activeTab === "Stake" ? "0%" : "100%"})`,
          }}
        />
      </div>

      {activeTab === "Stake" ? (
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
                <span className="text-gray-400">{selectedAsset.symbol}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Available: {formatUnits(userBalance, selectedAsset.decimals)} {selectedAsset.symbol}
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
              onClick={handleStakeConfirmClick}
              disabled={!!error || !referenceAmount}
              className={`w-full py-4 rounded-full font-medium transition-all duration-300 
                ${!error && referenceAmount 
                  ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                  : "bg-gray-600/50 text-gray-400 cursor-not-allowed"}`}
            >
              {error || !referenceAmount ? "Enter Amount" : "Confirm"}
            </button>
          ) : (
            <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-center items-center px-5 w-full">
              <ConnectWallet />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPositions.length > 0 ? (
            userPositions.map(([id, details]) => (
              <StakePositionComponent
                key={id.toString()}
                StakeId={id}
                onUnstake={() => unStakeVirtulTokens(id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              No active stakes
            </div>
          )}
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionType={activeTab === "Stake" ? "Stake" : "Unstake"}
        asset={selectedAsset}
        userBalance={userBalance}
        amount={referenceAmount}
        error={error}
        onSubmitTransaction={handleSubmitStakeTransaction}
        isLoading={isLoading}
        txError={txError}
        currentAction={currentAction}
      />
    </div>
  );
}
