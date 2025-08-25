import React, { useEffect, useState } from "react";
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
import { ChevronDown, ChevronUp } from "lucide-react";
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

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 1000,
    not_paused: false,
    min_collateral: 0n,
  });

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
      }, 20 * SECOND); // 20 seconds
    }

    return () => {
      clearInterval(interval);
    };
  }, [market]);

  const total = () => {
    if (margin == "") {
      return "--";
    }

    return Number(margin) * Number(leverage);
  };

  const fetchAndSetStatesDetails = async () => {
    try {
      let marketActor = new MarketActor(market.market_id, readAgent);
      let details = await marketActor.getStateDetails();

      // console.log(details);
      setMarketState(details);
    } catch (e) {
      console.log("Error fetching states details", e);
    }
  };

  const openOrder = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readWriteAgent);

      // let response = await marketActor.closePosition(accountIndex);
      let marginIn = parseUnits(margin, market.quoteAsset.decimals).toBigInt();
      let txresponse: string | null;
      if (orderType == "Limit") {
        if (limitPrice == "") {
          setError("Limit Price is required");
          return;
        }
        const max_tick = priceToTick(limitPrice);

        txresponse = await marketActor.openLimitOrder(
          accountIndex,
          tradeDirection == "Long",
          marginIn,
          leverage * 10,
          max_tick
        );
      } else {
        const max_tick: [bigint] | [] = [];
        txresponse = await marketActor.opneMarketOrder(
          accountIndex,
          tradeDirection == "Long",
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
        // Toggle accordion when clicking the active type
        onExpandChange?.(!isExpanded);
      } else {
        // Switch type and ensure accordion is open
        setOrderType(type);
        onExpandChange?.(true);
      }
    } else {
      setOrderType(type);
    }
  };

  return (
    <div className={`pt-2 pb-6 px-0 rounded-lg overflow-visible`}>
      <div className="mb-5 xxxl:mt-5 xxxl:space-y-8">
        {/* Order Type Selector */}
        <div className="relative p-1 mb-5 mx-3">
          <div className="flex items-center justify-between gap-6">
            <div
              className={`flex relative z-10 ${
                isAccordion ? "w-[calc(100%-40px)]" : "w-full"
              }`}
            >
              {(["Limit", "Market"] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={(e) => handleOrderTypeClick(type, e)}
                  className="flex items-center gap-2 flex-1 py-4 px-4 text-sm font-medium relative transition-colors duration-300"
                >
                  <ChevronUp
                    className={`w-4 h-4 
                     transition-transform duration-300`}
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

              {/* Sliding background - Moved inside the buttons container */}
              <div
                className={`absolute top-0 h-full transition-transform duration-300 ease-in-out w-1/2 bg-[#0300ad18] border-b-2 border-[#0300AD]`}
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

        {/* Trade Direction Selector */}
        <div className="relative mx-4 border border-[#363c52] rounded-lg border-opacity-40 bg-[#18191de9]">
          <div className="flex relative z-10">
            {(["Long", "Short"] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setTradeDirection(type)}
                className="flex-1 py-2  text-sm font-medium relative transition-colors duration-300"
              >
                <span
                  className={`relative z-10 ${
                    tradeDirection === type
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {type}
                </span>
              </button>
            ))}
          </div>
          {/* Sliding background */}
          <div
            className="absolute top-0 left-0 h-[calc(100%-0px)] w-[calc(50%-0px)] bg-[#0300ad18] border-2 border-dashed border-[#0300AD] transition-transform duration-300 ease-in-out rounded-md"
            style={{
              transform: `translateX(${
                tradeDirection === "Short" ? "100%" : "0%"
              })`,
            }}
          />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-14  xxxl:space-y-18">
        {/* Limit Price Input */}
        {orderType == "Limit" ? (
          <PriceInput
            long={tradeDirection == "Long"}
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

        {/* margin Input */}
        <MarginInput
          value={margin}
          market={market}
          setMargin={setMargin}
          setError={setError}
          minCollateral={marketState.min_collateral}
          readAgent={readAgent}
        />

        {/* Leverage Slider */}
        <LeverageSlider
          value={leverage}
          maxLeverage={marketState.max_leveragex10 / 10}
          setLeverage={setLeverage}
        />

        <div className="space-y-4 text-sm text-gray-400 pt-10 border-b border-gray-700 pb-5">
          <div className="flex justify-between">
            <span>Total: {total()}</span>
            {market.quoteAsset.symbol}
          </div>
          <div className="flex justify-between">
            <span>Market: </span>
            {market.baseAsset.symbol}-{market.quoteAsset.symbol}{" "}
          </div>
        </div>

        {/* <div className="mt-5 "> */}
        <ActionButton currentError={error} onClick={openOrder} />
        {/* </div> */}
      </div>

      {showNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              txErrorMessage ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {txErrorMessage ? txErrorMessage : "Position Opened Successfully"}
          </div>
        </div>
      )}
    </div>
  );
};
