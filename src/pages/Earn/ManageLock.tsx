import { HttpAgent, Agent } from "@dfinity/agent";
import { useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { LockSpan } from "../../utils/declarations/liquidity_manager/liquidity_manager.did";
import { LiquidityManagerActor } from "../../utils/Interfaces/liquidityManagerActor";
import { Principal } from "@dfinity/principal";
import { Icon, Dropdown } from "semantic-ui-react";
import { TransactionModal } from "./TransactionModal";
import { ConnectWallet } from "@nfid/identitykit/react";

interface Props {
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  selectedAsset: Asset;
}
type DurationOptions = {
  text: string;
  value: "2 Months" | "6 Months" | "1 Year";
};
let durationOptions: DurationOptions[] = [
  { text: "2 Months Lock", value: "2 Months" },
  { text: "6 Months Lock", value: "6 Months" },
  { text: "1 Year Lock", value: "1 Year" },
];

export default function ManageLock({
  readWriteAgent,
  readAgent,
  selectedAsset,
}: Props) {
  const { user } = useAuth();
  const [referenceAmount, setReferenceAmount] = useState<string>("");
  const [stakeSpan, setStakeSpan] = useState<
    "2 Months" | "6 Months" | "1 Year"
  >();
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
    if (Number(value) < 0) return;
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

      const vaultActor = new LiquidityManagerActor(vaultID, readWriteAgent);
      let span: LockSpan;
      if (stakeSpan == "1 Year") {
        span = { Year: null };
      } else if (stakeSpan == "2 Months") {
        span = { Month2: null };
      } else {
        span = { Month6: null };
      }
      const txResult = await vaultActor.lockQTokens(amount, span);

      if (!txResult) {
        setTxError("Locking transaction failed");
      }
    } catch (e) {
      setTxError("An unknown error occurred.");
    } finally {
      setCurrentAction(null);
      setReferenceAmount("");
    }
  };

  const handleDurationSelect = (
    _: React.SyntheticEvent<HTMLElement>,
    data: DurationOptions
  ) => {
    setStakeSpan(data.value);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-6 p-4 sm:p-5 lg:p-6 glass rounded-2xl border-2 border-dashed border-[#363c52] border-opacity-40">
      {/* Tab Container */}
      <div className="flex relative bg-white/5 rounded-lg p-1">
        <div className="flex relative z-10 w-full"></div>
        <div
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-2 border-dashed border-[#0300AD] transition-transform duration-300 ease-in-out rounded-lg"
          style={{
            transform: `translateX("0%")`,
          }}
        />
      </div>

      <div className="grid gap-3 lg:gap-6">
        {/* Amount Input */}
        <div className="space-y-2 lg:space-y-3">
          <div className="flex items-center gap-3 glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col flex-1 space-y-3">
              <span className="text-gray-400 text-xs lg:text-sm">Amount</span>
              <input
                type="text"
                className="bg-transparent text-white outline-none text-lg lg:text-2xl font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-500"
                placeholder="0.00"
                value={referenceAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                disabled={!readWriteAgent}
              />
              <span className="text-gray-400 text-xs lg:text-sm">
                Available: {formatUnits(userBalance, selectedAsset.decimals)} Q
                {selectedAsset.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedAsset.logoUrl && (
                <img
                  src={selectedAsset.logoUrl}
                  alt={selectedAsset.symbol}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-white font-medium">Q{selectedAsset.symbol}</span>
            </div>
          </div>
          {error && <p className="text-xs lg:text-sm text-red-500">{error}</p>}
        </div>

        {/* Duration Selector */}
        <div className="space-y-2 lg:space-y-3">
          <label className="text-xs lg:text-sm font-medium text-gray-400">
            Lock Duration
          </label>
          <Dropdown
            fluid
            selection
            placeholder="Select Lock Period"
            options={durationOptions}
            onChange={handleDurationSelect}
            value={stakeSpan}
            className="!bg-[#18191de9] !border !border-[#363c52] !border-opacity-40 !rounded-lg"
            style={{
              fontSize: "14px",
              padding: "12px 16px",
            }}
          />
        </div>

        {readWriteAgent ? (
          <button
            type="button"
            onClick={handleModalOpen}
            disabled={error != null || referenceAmount == "" || !stakeSpan}
            className={`w-full py-3 lg:py-4 rounded-xl text-sm lg:text-base font-medium transition-all duration-300 
                ${
                  !error && referenceAmount != "" && stakeSpan
                    ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                    : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                }`}
          >
            {referenceAmount == ""
              ? "Enter Amount"
              : !stakeSpan
              ? "Select Duration"
              : "Stake"}
          </button>
        ) : (
          <div className="bg-gradient-to-r from-[#0300AD] to-[#19195c] hover:from-[#02007a] hover:to-[#16213e] shadow-lg hover:shadow-xl border border-[#0300AD]/30 rounded-xl p-1">
            <ConnectWallet />
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onModalClose={handleModalClose}
        actionType={"Lock"}
        asset={selectedAsset}
        amount={referenceAmount}
        onSubmitTransaction={stakeVirtualTokens}
        txError={txError}
        currentAction={currentAction}
      />
    </div>
  );
}
