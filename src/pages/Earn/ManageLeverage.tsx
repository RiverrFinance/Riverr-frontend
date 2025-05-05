import { useAgent, useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { Icon } from "semantic-ui-react";
import { TransactionModal } from "./TransactionModal";
import { ConnectWallet } from "@nfid/identitykit/react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const COLORS = {
  default: ['#0300AD', '#1C1C28'],
  apy: ['#0300AD', '#18CCFC'],
  risk: ['#0300AD', '#2E5CFF', '#18CCFC'],
};

interface Props {
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  selectedAsset: Asset;
  isOperation?: boolean;
}

interface OperationsProps extends Props {
  activeTab: "Deposit" | "Withdraw";
  setActiveTab: (tab: "Deposit" | "Withdraw") => void;
  referenceAmount: string;
  useMarginBalance: bigint;
  usevTokenBalance: bigint;
  error: string;
  onAmountDepositChange: (value: string) => void;
  onAmountWithdrawChange: (value: string) => void;
  handleConfirmClick: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  handleSubmitTransaction: () => Promise<void>;
  isLoading: boolean;
  txError: string;
  currentAction: 'Appoving' | 'Transacting' | '';
}
export default function ManageLeverage({ readWriteAgent, readAgent, selectedAsset, isOperation = false }: Props) {
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

  return isOperation ? (
    <div className="grid grid-cols-1 gap-6 p-6 bg-[#18191de9] rounded-xl border-2 border-dashed border-[#363c52] border-opacity-40">
      {/* Operations UI code */}
      <ManageLeverage.Operations
        readWriteAgent={readWriteAgent}
        readAgent={readAgent}
        selectedAsset={selectedAsset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        referenceAmount={referenceAmount}
        useMarginBalance={useMarginBalance}
        usevTokenBalance={usevTokenBalance}
        error={error}
        onAmountDepositChange={onAmountDepositChange}
        onAmountWithdrawChange={onAmountWithdrawChange}
        handleConfirmClick={handleConfirmClick}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleSubmitTransaction={handleSubmitTransaction}
        isLoading={isLoading}
        txError={txError}
        currentAction={currentAction}
      />
    </div>
  ) : (
    <LeverageAnalytics />
  );
}


const LeverageAnalytics = () => {
  const leverageData = [
    { name: 'Supplied', value: 60 },
    { name: 'Available', value: 40 },
  ];

  const riskData = [
    { name: 'Low Risk', value: 30 },
    { name: 'Medium Risk', value: 45 },
    { name: 'High Risk', value: 25 },
  ];

  const apyData = [
    { name: 'Current APY', value: 75 },
    { name: 'Potential APY', value: 25 },
  ];

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        enabled: true
      }
    },
    cutout: '70%'
  };

  return (
    <div className="grid grid-rows-[1fr_1fr] gap-4 h-full">
      <div className="grid grid-cols-2 gap-4 min-h-0">
        {/* Risk Analysis Chart */}
        <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
          <h3 className="text-lg font-bold mb-2">Risk Analysis</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer>
              <Doughnut
                data={{
                  labels: riskData.map(d => d.name),
                  datasets: [{
                    data: riskData.map(d => d.value),
                    backgroundColor: COLORS.risk,
                    borderWidth: 0,
                  }]
                }}
                options={doughnutOptions}
              />
            </ResponsiveContainer>
          </div>
        </div>

        {/* APY Overview Chart */}
        <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
          <h3 className="text-lg font-bold mb-2">APY Overview</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer>
              <Doughnut
                data={{
                  labels: apyData.map(d => d.name),
                  datasets: [{
                    data: apyData.map(d => d.value),
                    backgroundColor: COLORS.apy,
                    borderWidth: 0,
                  }]
                }}
                options={doughnutOptions}
              />
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row - Lending Distribution */}
      <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0">
        <h3 className="text-lg font-bold mb-2">Lending Distribution</h3>
        <div className="flex-1 w-full h-[100px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={leverageData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                cy="50%"
                stroke="none"
              >
                {leverageData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.default[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Operations component as a subcomponent
ManageLeverage.Operations = function Operations({ readWriteAgent, readAgent, selectedAsset, ...props }: OperationsProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex relative bg-[#1C1C28] rounded-lg p-1">
        <div className="flex relative z-10 w-full">
          {(["Deposit", "Withdraw"] as const).map((tab) => (
            <button
              title="Select Tab"
              type="button"
              key={tab}
              onClick={() => props.setActiveTab(tab)}
              className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300 border-2 border-dashed border-transparent"
            >
              <span
                className={`relative z-10 ${
                  props.activeTab === tab
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
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-2 border-dashed border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
          style={{
            transform: `translateX(${props.activeTab === "Deposit" ? "0%" : "100%"})`,
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
              value={props.referenceAmount}
              onChange={(e) =>
                props.activeTab === "Deposit"
                  ? props.onAmountDepositChange(e.target.value)
                  : props.onAmountWithdrawChange(e.target.value)
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
              props.activeTab === "Deposit" ? props.useMarginBalance : props.usevTokenBalance,
              selectedAsset.decimals
            )}{" "}
            {selectedAsset.symbol}
          </p>
          {props.error && <p className="text-sm text-red-500">{props.error}</p>}
        </div>

        {readWriteAgent ? (
          <button
            type="button"
            onClick={props.handleConfirmClick}
            disabled={!!props.error || !props.referenceAmount}
            className={`w-full py-4 rounded-full font-medium transition-all duration-300 
              ${
                !props.error && props.referenceAmount
                  ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                  : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
              }`}
          >
            {props.error || !props.referenceAmount ? "Enter Amount" : "Confirm"}
          </button>
        ) : (
          <div className="bg-[#0300AD] hover:bg-[#02007a] rounded-md flex justify-center items-center px-5  w-full">
            <ConnectWallet />
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={props.isModalOpen}
        onClose={() => props.setIsModalOpen(false)}
        actionType={props.activeTab}
        asset={selectedAsset}
        userBalance={
          props.activeTab === "Deposit" ? props.useMarginBalance : props.usevTokenBalance
        }
        amount={props.referenceAmount}
        error={props.error}
        onSubmitTransaction={props.handleSubmitTransaction}
        isLoading={props.isLoading}
        txError={props.txError}
        currentAction={props.currentAction}
      />
    </div>
  );
};
