import React, { useEffect, useState, useRef } from "react";
import { Market } from "../../../../lists/marketlist";
import { MarketActor } from "../../../../utils/Interfaces/marketActor";
import { HttpAgent } from "@dfinity/agent";
import { StateDetails } from "../../../../utils/declarations/market/market.did";
import { LeverageSlider } from "./LeverageSlider";
import { PriceInput } from "./PriceInput";
import { parseUnits } from "ethers/lib/utils";
import { MarginInput } from "./MarginInput";
import { InputError } from "../../types/trading";
import ActionButton from "./ActionButton";
import { priceToTick } from "../../utilFunctions";
import { useAgent } from "@nfid/identitykit/react";
import { ChevronDown, ChevronUp, Info, Plus, X } from "lucide-react";
import { SECOND } from "../../../../utils/constants";

export interface TradingPanelProps {
  market: Market;
  readAgent: HttpAgent;
  accountIndex: number;
  initialOrderType?: "Market" | "Limit";
  isAccordion?: boolean;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

// Mock interfaces
interface MockMarketData {
  currentPrice: number;
  priceImpact: number;
  availableLiquidity: number;
  borrowingRate: number;
}

interface MockFeesData {
  executionFee: number;
  totalFees: number;
  priceImpactFee: number;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  market,
  readAgent,
  accountIndex,
  initialOrderType = "Limit",
  isAccordion = false,
  isExpanded = true,
  onExpandChange,
}) => {
  const readWriteAgent = useAgent();
  const [error, setError] = useState<InputError>(null);
  const [orderType, setOrderType] = useState<"Market" | "Limit">(
    initialOrderType
  );
  const [tradeDirection, setTradeDirection] = useState<"Long" | "Short">(
    "Long"
  );
  const [margin, setMargin] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);

  // State for new features
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>("");
  const [takeProfitPercentage, setTakeProfitPercentage] = useState<string>("");
  const [allowedSlippage, setAllowedSlippage] = useState<string>("");

  const [takeProfitEnabled, setTakeProfitEnabled] = useState<boolean>(false);
  const [showPriceWarning, setShowPriceWarning] = useState<boolean>(false);
  const [showSlippageOptions, setShowSlippageOptions] =
    useState<boolean>(false);
  const [showTakeProfitOptions, setShowTakeProfitOptions] =
    useState<boolean>(false);


  const slippageRef = useRef<HTMLDivElement>(null);
  const takeProfitRef = useRef<HTMLDivElement>(null);

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 1000,
    not_paused: false,
    min_collateral: 0n,
  });

  // Mock function to get current market price
  const getCurrentMarketPrice = (): number => {
    return market.baseAsset.symbol === "BTC" ? 45000 : 2800;
  };

  const [mockMarketData] = useState<MockMarketData>({
    currentPrice: getCurrentMarketPrice(),
    priceImpact: 0.02,
    availableLiquidity: 5000000,
    borrowingRate: 0.01,
  });

  const [mockFeesData] = useState<MockFeesData>({
    executionFee: 0.0005,
    totalFees: 0.08,
    priceImpactFee: 0.02,
  });

  const slippageOptions = ["0.3", "0.5", "1", "1.5"];
  const takeProfitPercentageOptions = ["10", "25", "50", "75", "100"];

  useEffect(() => {
    if (showNotification) {
      setTimeout(() => {
        setShowNotification(false);
      }, 3 * SECOND);
    }
  }, [showNotification]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (market.market_id) {
      fetchAndSetStatesDetails();
      interval = setInterval(() => {
        fetchAndSetStatesDetails();
      }, 20 * SECOND);
    }

    return () => {
      clearInterval(interval);
    };
  }, [market]);

  // close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        slippageRef.current &&
        !slippageRef.current.contains(event.target as Node)
      ) {
        setShowSlippageOptions(false);
      }
      if (
        takeProfitRef.current &&
        !takeProfitRef.current.contains(event.target as Node)
      ) {
        setShowTakeProfitOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // is take profit price below market price
  useEffect(() => {
    if (takeProfitPrice && takeProfitEnabled) {
      const currentPrice = getCurrentMarketPrice();
      const tpPrice = parseFloat(takeProfitPrice);
      setShowPriceWarning(tpPrice < currentPrice);
    } else {
      setShowPriceWarning(false);
    }
  }, [takeProfitPrice, takeProfitEnabled]);

  const total = () => {
    if (margin === "") {
      return "--";
    }
    return Number(margin) * Number(leverage);
  };

  // calculating the collateral value in USD
  const getCollateralValueUSD = (): string => {
    if (!margin || margin === "") return "0.00";

    const getQuoteAssetPrice = () => {
      switch (market.quoteAsset.symbol) {
        case "USDT":
          return 1;
        case "ICP":
          return 12.5;
        default:
          return 1;
      }
    };

    const quoteAssetPrice = getQuoteAssetPrice();
    return (Number(margin) * quoteAssetPrice).toFixed(2);
  };

  // calculating take profit PnL
  const calculateTakeProfitPnL = () => {
    if (!takeProfitEnabled || !takeProfitPrice || !margin || !limitPrice) {
      return { usd: 0, percentage: 0 };
    }

    const entryPrice =
      orderType === "Limit" ? Number(limitPrice) : mockMarketData.currentPrice;
    const exitPrice = Number(takeProfitPrice);
    const positionSize = Number(margin) * leverage;

    let pnlUsd = 0;
    if (tradeDirection === "Long") {
      pnlUsd = ((exitPrice - entryPrice) / entryPrice) * positionSize;
    } else {
      pnlUsd = ((entryPrice - exitPrice) / entryPrice) * positionSize;
    }

    const pnlPercentage = (pnlUsd / Number(margin)) * 100;

    return {
      usd: pnlUsd,
      percentage: pnlPercentage,
    };
  };

  // calculating liquidation price
  const calculateLiquidationPrice = (): string => {
    if (!margin || margin === "" || leverage <= 1) return "--";

    const entryPrice =
      orderType === "Limit" && limitPrice
        ? Number(limitPrice)
        : mockMarketData.currentPrice;
    const maintenanceMargin = 0.005;

    let liquidationPrice = 0;
    if (tradeDirection === "Long") {
      liquidationPrice = entryPrice * (1 - 1 / leverage + maintenanceMargin);
    } else {
      liquidationPrice = entryPrice * (1 + 1 / leverage - maintenanceMargin);
    }

    return `$${liquidationPrice.toFixed(2)}`;
  };

  // calculating fees
  const calculateFees = () => {
    if (!margin || margin === "") return { total: "0.00", priceImpact: "0.00" };

    const positionSize = Number(margin) * leverage;
    const totalFeesUsd = (positionSize * mockFeesData.totalFees) / 100;
    const priceImpactUsd = (positionSize * mockFeesData.priceImpactFee) / 100;

    return {
      total: totalFeesUsd.toFixed(2),
      priceImpact: `${mockFeesData.priceImpactFee.toFixed(
        3
      )}% / $${priceImpactUsd.toFixed(2)}`,
    };
  };

  // calculating execution fee in USD
  const getExecutionFeeUSD = (): string => {
    const icpPrice = 12.5;
    return (mockFeesData.executionFee * icpPrice).toFixed(2);
  };

  const fetchAndSetStatesDetails = async () => {
    try {
      let marketActor = new MarketActor(market.market_id, readAgent);
      let details = await marketActor.getStateDetails();
      setMarketState(details);
    } catch (e) {
      console.log("Error fetching states details", e);
    }
  };

  const openOrder = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readWriteAgent);

      let marginIn = parseUnits(margin, market.quoteAsset.decimals).toBigInt();
      let txresponse: string | null;

      if (orderType === "Limit") {
        if (limitPrice === "") {
          setError("Limit Price is required");
          return;
        }
        const max_tick = priceToTick(limitPrice);

        txresponse = await marketActor.openLimitOrder(
          accountIndex,
          tradeDirection === "Long",
          marginIn,
          leverage * 10,
          max_tick
        );
      } else {
        const max_tick: [bigint] | [] = [];
        txresponse = await marketActor.opneMarketOrder(
          accountIndex,
          tradeDirection === "Long",
          marginIn,
          leverage * 10,
          max_tick
        );
      }

      if (txresponse) {
        setTxErrorMessage(txresponse);
      }
    } catch (e) {
      alert(e);
      setTxErrorMessage("Error opening Position");
    } finally {
      setShowNotification(true);
    }
  };

  const handleOrderTypeClick = (
    type: "Limit" | "Market",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (isAccordion) {
      if (type === orderType) {
        onExpandChange?.(!isExpanded);
      } else {
        setOrderType(type);
        onExpandChange?.(true);
      }
    } else {
      setOrderType(type);
    }
  };

  const handleSlippageOptionClick = (option: string) => {
    setAllowedSlippage(option);
    setShowSlippageOptions(false);
  };

  const handleTakeProfitOptionClick = (option: string) => {
    setTakeProfitPercentage(option);
    setShowTakeProfitOptions(false);
  };

  const takeProfitPnL = calculateTakeProfitPnL();
  const fees = calculateFees();

  return (
    <div className={`px-0 h-full`}>
      {/* Main Trading Section */}
      <div className="glass rounded-t-lg rounded-b-2xl border border-gray-700/50 pb-8">

        {/* Trade Direction Selector */}
        <div className="relative border-b border-[#363c52] border-opacity-40 bg-white/5 backdrop-blur-sm rounded-t-lg">
          <div className="flex relative z-10">
            {(["Long", "Short"] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setTradeDirection(type)}
                className={`flex-1 py-2.5 sm:py-5 text-sm sm:text-base font-medium relative z-10 ${
                  tradeDirection === type
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {/* Sliding background */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 transition-transform duration-300 ease-in-out bg-[#0300ad18] border-[#0300AD] ${
              tradeDirection === "Long"
                ? "bg-green-500/10 border-b-[3px] border-green-500 rounded-tl-lg"
                : "bg-red-500/10 border-b-[3px] border-red-500 rounded-tr-lg"
            }`}
            style={{
              transform: `translateX(${
                tradeDirection === "Short" ? "100%" : "0%"
              })`,
            }}
          />
        </div>
        
        {/* Order Type Selector */}
        <div className="relative p-2 mt-7 pl-4">
          <div className="flex items-center justify-between gap-6 sm:gap-4">
            <div
              className={`flex relative z-10 ${
                isAccordion ? "w-[calc(100%-60px)]" : "w-fit"
              }`}
            >
              {(["Limit", "Market"] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={(e) => handleOrderTypeClick(type, e)}
                  className="flex items-center gap-2 flex-1 py-2 sm:py-3 px-2 sm:px-5 text-xs sm:text-sm font-medium relative transition-colors duration-300"
                >
                  <ChevronUp
                    className={`w-4 h-4 transition-transform duration-300 ${
                      orderType === type ? "rotate-180" : ""
                    }`}
                  />
                  <span
                    className={`relative z-10 ${
                      orderType === type
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </span>
                </button>
              ))}

              {/* Sliding background */}
              <div
                className={`absolute top-0 h-full transition-transform duration-300 ease-in-out w-1/2 left-0.5 rounded-lg glass`}
                style={{
                  transform: `translateX(${
                    orderType === "Market" ? "100%" : "0%"
                  })`,
                }}
              />
            </div>

            {isAccordion && (
              <div
                className="flex items-center px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandChange?.(!isExpanded);
                }}
              >
                <ChevronDown
                  className={`w-5 h-5 text-white transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-1 xxxl:space-y-3">
          {/* Limit Price Input */}
          <div className="space-y-1">
            {orderType === "Limit" ? (
              <PriceInput
                long={tradeDirection === "Long"}
                inputable={true}
                readAgent={readAgent}
                market={market}
                value={limitPrice}
                setLimitPrice={setLimitPrice}
              />
            ) : (
              <PriceInput
                long={false}
                inputable={false}
                readAgent={readAgent}
                market={market}
                value={limitPrice}
                setLimitPrice={setLimitPrice}
              />
            )}
          </div>

          {/* Margin Input */}
          <div className="space-y-3">
            <MarginInput
              value={margin}
              market={market}
              setMargin={setMargin}
              setError={setError}
              minCollateral={marketState.min_collateral}
              readAgent={readAgent}
            />
          </div>

          {/* Leverage Slider */}
          <div className="space-y-3 pt-5">
            <LeverageSlider
              value={leverage}
              maxLeverage={marketState.max_leveragex10 / 10}
              setLeverage={setLeverage}
            />
          </div>

          <div className="space-y-5 pt-4 sm:pt-16">
            {/* Position Summary */}
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400  border-b border-gray-700/50 pb-3 sm:pb-4">
              <div className="flex justify-between">
                <span>Total: {total()}</span>
                <span>{market.quoteAsset.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Market: </span>
                <span>
                  {market.baseAsset.symbol}-{market.quoteAsset.symbol}
                </span>
              </div>
            </div>

            {/* Collateral In */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Collateral In</span>
                <span className="text-white font-medium">
                  {market.quoteAsset.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">
                  {margin || "0.00"} {market.quoteAsset.symbol}
                </span>
                <span className="text-white">${getCollateralValueUSD()}</span>
              </div>
            </div>

            {/* Take Profit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Take Profit</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    title="Enable Take Profit"
                    type="checkbox"
                    checked={takeProfitEnabled}
                    onChange={(e) => setTakeProfitEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {takeProfitEnabled && (
                <div className="space-y-4">
                  {showPriceWarning && (
                    <div className="text-red-400 text-xs">
                      Trigger price below mark price
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Plus className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-400 text-sm whitespace-nowrap">
                        Take Profit
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">$</span>
                      <div className="relative">
                        <input
                          type="number"
                          value={takeProfitPrice}
                          onChange={(e) => setTakeProfitPrice(e.target.value)}
                          className="w-20 bg-transparent text-white text-sm outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border border-gray-600 rounded px-2 py-1 flex items-center gap-1 cursor-pointer border-gray-600/10"
                          placeholder="Price"
                        />
                      </div>
                      <div className="relative" ref={takeProfitRef}>
                        <input
                          type="number"
                          value={takeProfitPercentage}
                          onChange={(e) =>
                            setTakeProfitPercentage(e.target.value)
                          }
                          onClick={() =>
                            setShowTakeProfitOptions(!showTakeProfitOptions)
                          }
                          className="w-16 bg-transparent text-white text-sm outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border border-gray-600 rounded px-2 py-1"
                          placeholder="%"
                        />
                        {showTakeProfitOptions && (
                          <div className="absolute flex top-full right-0 mt-1 z-10 bg-[#070317fd] border border-gray-600 rounded-lg shadow-lg overflow-hidden">
                            {takeProfitPercentageOptions.map((option) => (
                              <div
                                key={option}
                                className="px-3 py-2 text-sm text-white hover:bg-[#0300AD] cursor-pointer"
                                onClick={() =>
                                  handleTakeProfitOptionClick(option)
                                }
                              >
                                {option}%
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">%</span>
                      <button
                        type="button"
                        title="Remove Take Profit"
                        className="text-gray-400 hover:text-white"
                        onClick={() => setTakeProfitEnabled(false)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Take Profit PnL */}
                  <div className="flex justify-between text-sm pl-6">
                    <span className="text-gray-400">Take Profit PnL</span>
                    <span
                      className={`${
                        takeProfitPnL.usd >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {takeProfitPnL.usd > 0
                        ? `+$${takeProfitPnL.usd.toFixed(
                            2
                          )} (+${takeProfitPnL.percentage.toFixed(2)}%)`
                        : "--"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              <ActionButton currentError={error} onClick={openOrder} />
            </div>            
          </div>

        </div>
      </div>

      {/* Lower Section */}
      <div className="mt-6 glass rounded-2xl border border-gray-700/50 p-4 space-y-5">
        {/* Liquidation Price */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Liquidation Price</span>
          <span className="text-white font-medium">
            {calculateLiquidationPrice()}
          </span>
        </div>

        {/* Fees */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price Impact / Fees</span>
          <span className="text-white">{fees.priceImpact}</span>
        </div>

        {/* Execution Fees */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Execution Fee</span>
          <span className="text-white">
            {mockFeesData.executionFee} {market.quoteAsset.symbol} ($
            {getExecutionFeeUSD()})
          </span>
        </div>

        {/* Allowed Slippage */}
        <div className="flex justify-between items-center text-sm relative">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Allowed Slippage</span>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-lg bg-[#070317fd] border border-[#ffffff14] shadow-xl text-xs opacity-0  group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                <p className="text-gray-300">
                  The maximum difference between expected and actual execution
                  price. Higher slippage tolerance increases execution
                  likelihood but may result in worse prices.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" ref={slippageRef}>
            <div className="relative">
              <input
                type="number"
                value={allowedSlippage}
                onChange={(e) => setAllowedSlippage(e.target.value)}
                onClick={() => setShowSlippageOptions(!showSlippageOptions)}
                className="w-16 bg-transparent text-white text-sm outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border border-gray-600 rounded px-2 py-1"
                placeholder="%"
              />
              {showSlippageOptions && (
                <div className="absolute flex bottom-full right-0 mb-1 z-10 bg-[#070317fd] border border-gray-600 rounded-lg shadow-lg overflow-hidden">
                  {slippageOptions.map((option) => (
                    <div
                      key={option}
                      className="px-3 py-2 text-sm text-white hover:bg-[#0300AD] cursor-pointer"
                      onClick={() => handleSlippageOptionClick(option)}
                    >
                      {option}%
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-400 text-sm">%</span>
          </div>
        </div>
      </div>

      {showNotification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg glass border ${
              txErrorMessage
                ? "border-red-500 bg-red-500/10"
                : "border-green-500 bg-green-500/10"
            } text-white font-medium`}
          >
            {txErrorMessage ? txErrorMessage : "Position Opened Successfully"}
          </div>
        </div>
      )}
    </div>
  );
};
