import React, { useEffect, useState } from "react";
import { Market } from "../../../lists/marketlist";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { StateDetails } from "../../../utils/declarations/market/market.did";
import { LeverageSlider } from "./LeverageSlider";
import { PriceInput } from "./PriceInput";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { MarginInput } from "./MarginInput";

import { InputError } from "../types/trading";
import ActionButton from "./ActionButton";
import { priceToTick } from "../utilFunctions";
import { useAgent } from "@nfid/identitykit/react";

export interface TradingPanelProps {
  market: Market;
  onOrderSubmit?: () => void;
  readAgent: HttpAgent;
  accountIndex: number;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  market,
  readAgent,
  accountIndex,
}) => {
  const readWriteAgent = useAgent();
  const [error, setError] = useState<InputError>("");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Limit");
  const [tradeDirection, setTradeDirection] = useState<"Long" | "Short">(
    "Long"
  );
  const [margin, setMargin] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 1000,
    not_paused: false,
    current_tick: 0n,
    base_token_multiple: 20,
    min_collateral: 0n,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (market.market_id) {
      fetchAndSetStatesDetails();
      interval = setInterval(() => {
        fetchAndSetStatesDetails();
      }, 20000); // 20 seconds
    }

    return () => {
      clearInterval(interval);
    };
  }, [market]);

  const total = () => {
    if (margin == "") {
      return "--";
    }
    return formatUnits(
      Number(margin) * Number(leverage),
      market.quoteAsset.decimals
    );
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
      if (error == "" && Number(margin) > 0 && Number(limitPrice) > 0) {
        const marketActor = new MarketActor(market.market_id, readWriteAgent);

        // let response = await marketActor.closePosition(accountIndex);

        let type;
        let max_tick: [bigint] | [];
        if (orderType == "Limit") {
          type = { Limit: null };
          max_tick = [priceToTick(limitPrice)];
        } else {
          type = { Market: null };
          max_tick = [];
        }
        let marginIn = parseUnits(
          margin,
          market.quoteAsset.decimals
        ).toBigInt();
        let txresponse: boolean = await marketActor.openPosition(
          accountIndex,
          marginIn,
          tradeDirection == "Long",
          type,
          leverage * 10,
          max_tick
        );
      }
    } catch {}
  };

  return (
    <div className={`py-8 px-0 rounded-lg xxxl:space-y-8`}>
      <div className="mb-5 xxxl:mt-5 xxxl:space-y-8">
        {/* Order Type Selector */}
        <div className="relative p-1 mb-5 mx-3">
          <div className="flex relative z-10">
            {(["Limit", "Market"] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setOrderType(type)}
                className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300"
              >
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
          </div>
          {/* Sliding background */}
          <div
            className="absolute top-1 h-[calc(100%-8px)] w-1/2 bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(${
                orderType === "Market" ? "100%" : "0%"
              })`,
            }}
          />
        </div>

        {/* Trade Direction Selector */}
        <div className="relative mx-4 border border-[#363c52] border-dashed rounded-lg border-opacity-40 bg-[#18191de9] w-32">
          <div className="flex z-10">
            {(["Long", "Short"] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setTradeDirection(type)}
                className={`flex-1 py-2 text-sm font-medium relative  duration-300 ${
                  tradeDirection === type
                    ? "bg-[#0300adfd] rounded-md"
                    : "border-none"
                }`}
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
            readAgent={readAgent}
            market={market}
            value={limitPrice}
            setLimitPrice={setLimitPrice}
          />
        ) : (
          <></>
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
    </div>
  );
};
