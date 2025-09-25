import { ChevronLeft, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Market } from "../../lists/marketlist";
import {
  AreaChart as RechartsAreaChart,
  Area,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { XAxis, YAxis } from "recharts";
import { ConnectWallet, useAgent } from "@nfid/identitykit/react";
import { SkeletonLoader } from "../../components/SkeletonLoader";
import { PoolTransactionModal } from "./PoolTransactionModal";

export const PoolDetails = ({
  market,
  onBack,
}: {
  market: Market;
  onBack: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"BUY" | "SELL">("BUY");
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const readWriteAgent = useAgent();
  const [isHeaderLoading, setIsHeaderLoading] = useState<boolean>(true);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "Approving..." | "Processing..." | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubTab, setSelectedSubTab] = useState<"Performance" | "Price">(
    "Performance"
  );
  const [conversionRate] = useState(1.5);

  const tvl = 105.21;
  const gmAmount = 47.46;
  const annualizedPerf = 11.86;
  const longCollateral = 49.95;
  const shortCollateral = 50.04;
  // mock balances
  const quoteBalance = 0;
  const gmBalance = 0;

  useEffect(() => {
    const t = setTimeout(() => setIsHeaderLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onPayAmountChange = (val: string) => {
    if (Number(val) < 0) return;
    setPayAmount(val);
    // Calculate receive amount based on conversion rate
    const receivedAmount = Number(val) * conversionRate;
    setReceiveAmount(receivedAmount.toString());

    if (val === "") {
      setError(null);
      return;
    }
    const n = Number(val);
    if (isNaN(n)) {
      setError("Invalid amount");
    } else if (activeTab === "BUY" && n > quoteBalance) {
      setError("Insufficient balance");
    } else if (activeTab === "SELL" && n > gmBalance) {
      setError("Insufficient balance");
    } else {
      setError(null);
    }
  };

  const onReceiveAmountChange = (val: string) => {
    if (Number(val) < 0) return;
    setReceiveAmount(val);
    // Calculate pay amount based on inverse conversion rate
    const payValue = Number(val) / conversionRate;
    setPayAmount(payValue.toString());

    if (val === "") {
      setError(null);
      return;
    }
    const n = Number(val);
    if (isNaN(n)) {
      setError("Invalid amount");
    } else if (activeTab === "BUY" && n > quoteBalance) {
      setError("Insufficient balance");
    } else if (activeTab === "SELL" && n > gmBalance) {
      setError("Insufficient balance");
    } else {
      setError(null);
    }
  };

  const handleOpenTxModal = () => setIsTxModalOpen(true);
  const handleCloseTxModal = () => {
    setIsTxModalOpen(false);
    setTxError(null);
  };

  // mock buy/sell
  const submitBuyOrSell = async (): Promise<void> => {
    setCurrentAction("Processing...");
    try {
      console.log(activeTab === "BUY" ? "buy gm" : "sell gm", payAmount);
      await new Promise((r) => setTimeout(r, 1200));
    } catch (e) {
      setTxError("Transaction failed");
    } finally {
      setCurrentAction(null);
    }
  };

  const tradingParameters = [
    { name: "Free Liq", value: 35, color: "#6366f1" },
    { name: "Reserved", value: 40, color: "#22c55e" },
    { name: "Debt", value: 25, color: "#f43f5e" },
  ];

  // Update the performanceData array to include proper range values
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    date: `${20 + i}/06`,
    performance: Math.max(
      0,
      Math.floor(Math.sin(i / 3) * 15 + Math.random() * 5 + 15)
    ), // Always positive values
    price: 1200 + Math.sin(i / 2) * 50 + Math.random() * 20,
  }));

  // Update grid layout and spacing classes
  return (
    <div className="min-h-screen text-white">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Back to Pools */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-3 sm:mb-4 lg:mb-6 transition-colors border border-white/10 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 glass overflow-hidden"
        >
          <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">Back to Pools</span>
        </button>

        {/* Sticky Header - Make it more compact on mobile */}
        <div className="sticky top-0 z-30 glass bg-[#16182e] border-b border-white/10 p-3 sm:p-4 lg:p-6 shadow-md rounded-b-none rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              {isHeaderLoading ? (
                <div className="flex items-center">
                  <SkeletonLoader className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
                  <div className="-ml-3">
                    <SkeletonLoader className="w-6 h-6 lg:w-8 lg:h-8 rounded-full" />
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={market.baseAsset.logoUrl}
                    alt={market.baseAsset.symbol}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full"
                  />
                  <img
                    src={market.quoteAsset.logoUrl}
                    alt={market.quoteAsset.symbol}
                    className="w-6 h-6 lg:w-8 lg:h-8 rounded-full absolute -bottom-1 -right-1 border-2 border-[#16182e]"
                  />
                </>
              )}
            </div>
            <div>
              {isHeaderLoading ? (
                <div className="space-y-2">
                  <SkeletonLoader className="w-44 h-5 rounded" />
                  <SkeletonLoader className="w-28 h-4 rounded" />
                </div>
              ) : (
                <>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">
                    GM: {market.baseAsset.symbol.toUpperCase()}/
                    {market.quoteAsset.symbol.toUpperCase()}
                  </h1>
                  <p className="text-gray-400 text-xs lg:text-sm">
                    [{market.baseAsset.symbol.toUpperCase()}-
                    {market.quoteAsset.symbol.toUpperCase()}]
                  </p>
                </>
              )}
            </div>
            <div className="ml-auto flex flex-col items-end">
              {isHeaderLoading ? (
                <div className="space-y-2 items-end flex flex-col">
                  <SkeletonLoader className="w-20 h-4 rounded" />
                  <SkeletonLoader className="w-24 h-6 rounded" />
                  <SkeletonLoader className="w-24 h-3 rounded" />
                </div>
              ) : (
                <>
                  <span className="text-gray-400 text-xs lg:text-sm">
                    TVL (Supply)
                  </span>
                  <span className="text-white font-bold text-lg">
                    ${tvl.toFixed(2)}m
                  </span>
                  <span className="text-gray-500 text-xs">
                    ({gmAmount.toFixed(2)}m GM)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart Tabs */}
        <div className="sticky top-[60px] sm:top-[72px] z-20">
          <div className="relative flex w-full max-w-[200px] sm:max-w-[240px]">
            {["Performance", "Price"].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setSelectedSubTab(tab as any)}
                className={`flex-1 py-3 font-semibold text-base relative z-10 transition-colors ${
                  selectedSubTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
            <div
              className={`absolute top-0 h-full transition-transform duration-300 ease-in-out w-1/2 bg-[#0300ad18] border-b-2 border-[#0300AD]`}
              style={{
                transform: `translateX(${
                  selectedSubTab === "Price" ? "100%" : "0%"
                })`,
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            {/* Pool Panel */}
            <div className="lg:col-span-4 w-full flex-shrink-0 lg:order-2">
              <div className="glass bg-[#16182e] h-full rounded-2xl border border-white/10 shadow-md overflow-hidden">
                {/* Trade Direction Selector stays at the top */}
                <div className="relative border-b border-[#363c52] border-opacity-40">
                  <div className="flex relative z-10">
                    {(["BUY", "SELL"] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`flex-1 py-2.5 sm:py-5 text-sm sm:text-base font-medium relative z-10 ${
                          activeTab === type
                            ? "text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {type} GM
                      </button>
                    ))}
                  </div>
                  {/* Sliding background */}
                  <div
                    className={`absolute top-0 left-0 h-full w-1/2 transition-transform duration-300 ease-in-out ${
                      activeTab === "BUY"
                        ? "bg-green-500/10 border-b-[3px] border-green-500 rounded-tl-lg"
                        : "bg-red-500/10 border-b-[3px] border-red-500 rounded-tr-lg transform translate-x-full"
                    }`}
                  />
                </div>

                {/* Main Trading Section */}
                <div className="p-3 sm:p-4 lg:p-6 space-y-4">
                  {/* Trading Inputs Section */}
                  <div className="space-y-1">
                    {/* Pay Input */}
                    <div className="flex items-center gap-2 sm:gap-3 glass rounded-xl p-3 sm:p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
                      <div className="flex flex-col flex-1 space-y-2 sm:space-y-3  overflow-hidden">
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Pay
                        </span>
                        <input
                          type="number"
                          value={payAmount}
                          onChange={(e) => onPayAmountChange(e.target.value)}
                          placeholder="0.0"
                          className="bg-transparent text-white outline-none text-xl sm:text-2xl font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-500"
                        />
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Available:{" "}
                          {activeTab === "BUY"
                            ? quoteBalance.toFixed(2)
                            : gmBalance.toFixed(2)}{" "}
                          {activeTab === "BUY"
                            ? market.quoteAsset.symbol
                            : `GM`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          {activeTab === "BUY" ? (
                            <>
                              <img
                                src={market.quoteAsset.logoUrl}
                                alt={market.quoteAsset.symbol}
                                className="w-8 h-8 rounded-full"
                              />
                            </>
                          ) : (
                            <div className="relative lg:hidden xl:block">
                              <img
                                src={market.baseAsset.logoUrl}
                                alt={market.baseAsset.symbol}
                                className="w-8 h-8 rounded-full"
                              />
                              <img
                                src={market.quoteAsset.logoUrl}
                                alt={market.quoteAsset.symbol}
                                className="w-5 h-5 rounded-full absolute -bottom-1 -right-1 border-2 border-[#16182e]"
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium">
                          {activeTab === "BUY"
                            ? market.quoteAsset.symbol
                            : `GM ${market.baseAsset.symbol}/${market.quoteAsset.symbol}`}
                        </span>
                      </div>
                    </div>

                    {/* Receive Input */}
                    <div className="flex items-center gap-2 sm:gap-3 glass rounded-xl p-3 sm:p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
                      <div className="flex flex-col flex-1 space-y-2 sm:space-y-3 overflow-hidden">
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Receive
                        </span>
                        <input
                          type="number"
                          value={receiveAmount}
                          onChange={(e) =>
                            onReceiveAmountChange(e.target.value)
                          }
                          placeholder="0.0"
                          className="bg-transparent text-white outline-none text-xl sm:text-2xl font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-500"
                        />
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Available:{" "}
                          {activeTab === "BUY"
                            ? gmBalance.toFixed(2)
                            : quoteBalance.toFixed(2)}{" "}
                          {activeTab === "BUY"
                            ? `GM`
                            : market.quoteAsset.symbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          {activeTab === "BUY" ? (
                            <div className="relative lg:hidden xl:block">
                              <img
                                src={market.baseAsset.logoUrl}
                                alt={market.baseAsset.symbol}
                                className="w-7 h-7 rounded-full"
                              />
                              <img
                                src={market.quoteAsset.logoUrl}
                                alt={market.quoteAsset.symbol}
                                className="w-4 h-4 rounded-full absolute -bottom-1 -right-1 border-2 border-[#16182e]"
                              />
                            </div>
                          ) : (
                            <>
                              <img
                                src={market.quoteAsset.logoUrl}
                                alt={market.quoteAsset.symbol}
                                className="w-8 h-8 rounded-full"
                              />
                            </>
                          )}
                        </div>
                        <span className="text-white font-medium">
                          {activeTab === "BUY"
                            ? `GM: ${market.baseAsset.symbol}/${market.quoteAsset.symbol}`
                            : market.quoteAsset.symbol}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-400 text-xs sm:text-sm mx-3 sm:mx-4 lg:mx-6">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 sm:pt-4 border-t border-white/10">
                    {readWriteAgent ? (
                      <button
                        type="button"
                        onClick={handleOpenTxModal}
                        disabled={
                          !!error || payAmount === "" || currentAction !== null
                        }
                        className={`w-full py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                          !error && payAmount !== "" && currentAction === null
                            ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
                            : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {currentAction ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {currentAction}
                          </span>
                        ) : payAmount === "" ? (
                          "Enter Amount"
                        ) : (
                          `${activeTab} GM`
                        )}
                      </button>
                    ) : (
                      <div className="bg-gradient-to-r from-[#0300AD] to-[#19195c] hover:from-[#02007a] hover:to-[#16213e] shadow-lg hover:shadow-xl border border-[#0300AD]/30 rounded-xl p-1">
                        <ConnectWallet />
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower Section with different styling */}
                <div className="border-t border-white/10 p-4 lg:p-6 space-y-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Price Impact / Fees</span>
                    <span className="text-green-400">-0.000% / -0.000%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Execution Fee</span>
                    <span>~0.01 ICP</span>
                  </div>
                </div>
              </div>

              <PoolTransactionModal
                isOpen={isTxModalOpen}
                onModalClose={handleCloseTxModal}
                actionType={activeTab}
                amount={payAmount}
                onSubmitTransaction={submitBuyOrSell}
                txError={txError}
                symbol={market.quoteAsset.symbol}
                currentAction={currentAction}
              />
            </div>

            {/* Chart and Info Section */}
            <div className="lg:col-span-8 flex-1 min-w-0 space-y-4 sm:space-y-5 lg:space-y-6 lg:order-1">
              {/* Chart content */}
              <div className="glass bg-[#16182e] rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/10 shadow-md h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-green-400">
                      {selectedSubTab === "Performance"
                        ? `${annualizedPerf}%`
                        : `$${performanceData[
                            performanceData.length - 1
                          ].price.toFixed(2)}`}
                    </h2>
                    <span className="text-gray-400 text-sm">
                      {selectedSubTab === "Performance"
                        ? "Annualized Performance"
                        : "Current Price"}
                    </span>
                  </div>
                </div>
                <div className="h-[calc(100%-80px)] min-h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart
                      data={performanceData}
                      margin={{ left: 24, right: 24, top: 16, bottom: 24 }}
                    >
                      <defs>
                        <linearGradient
                          id="performanceGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4f60ff"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor="#4f60ff"
                            stopOpacity={0.01}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                        domain={
                          selectedSubTab === "Performance"
                            ? [0, 30]
                            : ["auto", "auto"]
                        }
                        tickFormatter={(value) =>
                          selectedSubTab === "Performance"
                            ? `${value}%`
                            : `$${value.toFixed(0)}`
                        }
                        ticks={
                          selectedSubTab === "Performance"
                            ? [0, 10, 20, 30]
                            : undefined
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#16182e",
                          border: "1px solid #374151",
                          borderRadius: 4,
                          padding: "4px 8px",
                          fontSize: "11px",
                        }}
                        labelStyle={{
                          color: "#a1a1aa",
                          marginBottom: 2,
                          fontSize: "11px",
                        }}
                        formatter={(value: number) => [
                          selectedSubTab === "Performance"
                            ? `${value.toFixed(2)}%`
                            : `$${value.toFixed(2)}`,
                          "",
                        ]}
                      />
                      {/* Grid lines */}
                      {selectedSubTab === "Performance" ? (
                        <g>
                          {[-15, -10, -5, 0, 5, 10, 15].map((tick) => (
                            <line
                              key={tick}
                              x1="0%"
                              x2="100%"
                              y1={`${((tick + 15) / 30) * 100}%`}
                              y2={`${((tick + 15) / 30) * 100}%`}
                              stroke="#ffffff10"
                              strokeDasharray="4 6"
                            />
                          ))}
                        </g>
                      ) : (
                        <g>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <line
                              key={i}
                              x1="0%"
                              x2="100%"
                              y1={`${i * 20}%`}
                              y2={`${i * 20}%`}
                              stroke="#ffffff10"
                              strokeDasharray="4 6"
                            />
                          ))}
                        </g>
                      )}
                      <Area
                        type="monotone"
                        dataKey={
                          selectedSubTab === "Performance"
                            ? "performance"
                            : "price"
                        }
                        stroke="#4f60ff"
                        strokeWidth={2}
                        fill="url(#performanceGradient)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* About sections */}
            <div className="lg:col-span-8 w-full lg:order-3">
              <div className="glass bg-[#16182e] rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-md h-full">
                <h3 className="text-2xl font-bold text-white mb-6">
                  About This Pool
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#0300ad18] border border-[#0300AD]">
                      <svg
                        className="w-6 h-6 text-[#4f60ff]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        High Performance
                      </h4>
                      <p className="text-gray-400 leading-relaxed">
                        This pool has consistently delivered strong returns
                        through efficient market making and dynamic liquidity
                        provision.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#0300ad18] border border-[#0300AD]">
                      <svg
                        className="w-6 h-6 text-[#4f60ff]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Risk Management
                      </h4>
                      <p className="text-gray-400 leading-relaxed">
                        Advanced risk management systems protect the pool
                        against adverse market movements and ensure sustainable
                        returns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Parameters - Pie Chart */}
            <div className="lg:col-span-4 w-full lg:order-4">
              <div className="glass bg-[#16182e] rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/10 shadow-md h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Trading Parameters</h3>
                  <div className="relative group">
                    <Info className="w-5 h-5 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-lg bg-[#03050b] border border-[#ffffff14] shadow-xl text-xs opacity-0  group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                      <p className="text-gray-300">
                        Overview of pool's current trading conditions including
                        available liquidity and risk parameters.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center h-[250px]">
                  <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                      <Pie
                        data={tradingParameters}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                        }) => {
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 1.8; // radius multiplier
                          const x =
                            cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y =
                            cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="middle"
                              fontSize="10" // font size
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {tradingParameters.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="none"
                            // fontSize={10}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, ""]}
                        contentStyle={{
                          backgroundColor: "#16182e",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        itemStyle={{
                          color: "white",
                          fontSize: "12px",
                        }}
                        labelStyle={{
                          display: "none",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {tradingParameters.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-xs text-gray-300">
                          {entry.name}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {entry.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
