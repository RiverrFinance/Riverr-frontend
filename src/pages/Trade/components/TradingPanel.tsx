import React, { useEffect, useState } from "react";
import { Market } from "../../../lists/marketlist";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { StateDetails } from "../../../utils/declarations/market/market.did";
import { useAgent } from "@nfid/identitykit/react";
import { LeverageSlider } from "./LeverageSlider";
import { PriceInput } from "./PriceInput";
import { parseUnits } from "ethers/lib/utils";
import { MarginInput } from "./MarginInput";

import { InputError } from "../types/trading";
import ActionButton from "./ActionButton";

const ICP_API_HOST = "https://icp-api.io/";

export interface TradingPanelProps {
  market: Market;
  onOrderSubmit?: () => void;
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  market,
  readAgent,
  readWriteAgent,
}) => {
  const [error, setError] = useState<InputError>("");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  const [tradeDirection, setTradeDirection] = useState<"Long" | "Short">("Long");
  const [margin, setMargin] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);
  // const [payAmount, setPayAmount] = useState<string>(""); 
  // const isWalletConnected = !!readWriteAgent; 

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 1000,
    not_paused: false,
    current_tick: 0n,
    base_token_multiple: 20,
    min_collateral: 0n,
  });

  useEffect(() => {
    fetchAndSetStatesDetails();
    const interval = setInterval(() => {
      fetchAndSetStatesDetails();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // const total = () => {
  //   if (margin == "") {
  //     return "--";
  //   }
  //   return Number(margin) * Number(leverage);
  // };


  const fetchAndSetStatesDetails = async () => {
    try {
      if (market.market_id) {
        let marketActor = new MarketActor(market.market_id, readAgent);
        let details = await marketActor.getStateDetails();
        setMarketState(details);
      }
    } catch (e) {
      console.log("Error fetching states details", e);
    }
  };

  const openOrder = () => {}
  //   console.log("Attempting to open order with:", {
  //     // market: market.name,
  //     orderType,
  //     tradeDirection,
  //     payAmount, // Using payAmount
  //     baseAssetAmount, // Using baseAssetAmount
  //     limitPrice,
  //     leverage,
  //   });
  // };
  
  //   // Handlers for input changes
  //   const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setPayAmount(e.target.value);
  //     // You might add logic here to calculate baseAssetAmount or other related values
  //   };
  
  //   const handleBaseAssetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setBaseAssetAmount(e.target.value);
  //     // You might add logic here to calculate payAmount or other related values
  //   };

  // useEffect(() => {
  //   HttpAgent.create({ host: ICP_API_HOST }).then(setUnauthenticatedAgent);

  //   // const interval = setInterval(() => {
  //   //   fetchAndSetStatesDetails();
  //   // }, 5000);

  //   // return () => {
  //   //   clearInterval(interval);
  //   // };
  // }, []);

  // useEffect(() => {
  //   fetchAndSetStatesDetails(); // fetching market state details when the market prop changes or readAgent is set
  // }, [market, readAgent]);

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
            market={market}
            value={limitPrice}
            initialTick={marketState.current_tick}
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
          <div>Pool: {market.quoteAsset.symbol}</div>
          <div>Collateral in: Available: 0.00 {market.baseAsset.symbol} </div>
          <hr />
          <div>Execution Price: - </div> 
          <div>Liq. Price: - </div> 
          <hr />
          <div>Fees: - </div> 
          <div>Network Fee: - </div> 
          <div>TP/SL: </div>
        </div>



        <div className="flex justify-center mt-4">
          <ActionButton
            currentError={error}
            onClick={openOrder}
          />
        </div>
      </div>

    </div>
  );
};