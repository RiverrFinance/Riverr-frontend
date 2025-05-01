import React, { useEffect, useState } from "react";
import { Market } from "../../../lists/marketlist";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { StateDetails } from "../../../utils/declarations/market/market.did";
import { LeverageSlider } from "./LeverageSlider";
import { PriceInput } from "./PriceInput";
import { parseUnits } from "ethers/lib/utils";
import { MarginInput } from "./MarginInput";

import { InputError } from "../types/trading";
import ActionButton from "./ActionButton";
import { priceToTick, tickToPrice } from "../utilFunctions";

const ICP_API_HOST = "https://icp-api.io/";

export interface TradingPanelProps {
  market: Market;
  onOrderSubmit?: () => void;
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  accountIndex: number;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  market,
  readAgent,
  readWriteAgent,
  accountIndex,
}) => {
  const [error, setError] = useState<InputError>("");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  const [tradeDirection, setTradeDirection] = useState<"Long" | "Short">(
    "Long"
  );
  const [margin, setMargin] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("0.0");
  const [leverage, setLeverage] = useState<number>(1);

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 1000,
    not_paused: false,
    current_tick: 0n,
    base_token_multiple: 20,
    min_collateral: 0n,
  });

  useEffect(() => {
    fetchAndSetStatesDetails();
    let interval: undefined | number;

    if (market.market_id) {
      const interval = setInterval(() => {
        fetchAndSetStatesDetails();
      }, 10000); // 10 seconds
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

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
      console.log(details);
      setMarketState(details);
    } catch (e) {
      console.log("Error fetching states details", e);
    }
  };

  const openOrder = async () => {
    try {
      if (error == "" && Number(margin) > 0) {
        const marketActor = new MarketActor(market.market_id, readWriteAgent);

        let type;
        let max_tick;
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
        let txresponse = await marketActor.openPosition(
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
    <div className={`p-3 rounded-lg`}>
      <div className="mb-5">
        <div className="flex p-1 mb-5 mx-3">
          {(["Limit", "Market"] as const).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-all duration-200
                ${
                  orderType === type
                    ? "text-blue-500 font-medium text-md border-b border-b-blue-500 px-4 py-1 transition-all duration-200"
                    : "text-gray-400 hover:text-white transition-colors duration-200 text-md"
                }`}
              // disabled={!isWalletConnected}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex bg-[#1C1C28] p-1 mx-4 border border-gray-700 rounded-md ">
          {(["Long", "Short"] as const).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setTradeDirection(type)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  tradeDirection === type
                    ? "text-gray-900 font-medium text-md bg-blue-500 rounded-md px-4 py-1 transition-all duration-200"
                    : "text-white transition-colors duration-200 text-md"
                }`}
              // disabled={!isWalletConnected}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
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
          readWriteAgent={readWriteAgent}
          readAgent={readAgent}
        />

        {/* Leverage Slider */}
        <LeverageSlider
          value={leverage}
          maxLeverage={marketState.max_leveragex10 / 10}
          setLeverage={setLeverage}
        />

        <div className="space-y-2 text-sm text-gray-400">
          <div>
            Total: {total()}
            {market.quoteAsset.symbol}
          </div>
          <hr />
          <div>
            Market: {market.baseAsset.symbol}-{market.quoteAsset.symbol}{" "}
          </div>
          <hr />
        </div>

        <div className="flex justify-center mt-4">
          <ActionButton currentError={error} onClick={openOrder} />
        </div>
      </div>
    </div>
  );
};
