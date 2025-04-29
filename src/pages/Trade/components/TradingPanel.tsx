import React, { useEffect, useState } from "react";
import { Icon } from "semantic-ui-react";
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
  const [tradeDirection, setActiveTab] = useState<"Long" | "Short">("Long");
  const [margin, setMargin] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);
  const [payAmount, setPayAmount] = useState<string>(""); 
  const [baseAssetAmount, setBaseAssetAmount] = useState<string>("");

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 1000,
    not_paused: false,
    current_tick: 0n,
    base_token_multiple: 20,
    min_collateral: 0n,
  });

  useEffect(() => {
    fetchAndSetStatezDetails();
    const interval = setInterval(() => {
      fetchAndSetStatezDetails();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {});

  const total = () => {
    if (margin == "") {
      return "--";
    }
    return Number(margin) * Number(leverage);
  };

  const isWalletConnected = !!readWriteAgent;

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

  const openOrder = () => {
    console.log("Attempting to open order with:", {
      // market: market.name,
      orderType,
      tradeDirection,
      payAmount, // Using payAmount
      baseAssetAmount, // Using baseAssetAmount
      limitPrice,
      leverage,
    });
  };
  
    // Handlers for input changes
    const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPayAmount(e.target.value);
      // You might add logic here to calculate baseAssetAmount or other related values
    };
  
    const handleBaseAssetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setBaseAssetAmount(e.target.value);
      // You might add logic here to calculate payAmount or other related values
    };

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setUnauthenticatedAgent);

    // const interval = setInterval(() => {
    //   fetchAndSetStatesDetails();
    // }, 5000);

    // return () => {
    //   clearInterval(interval);
    // };
  }, []);

  useEffect(() => {
    fetchAndSetStatesDetails(); // fetching market state details when the market prop changes or readAgent is set
  }, [market, readAgent]);

  return (
    // <div className={`p-3`}>
    //   <div className="flex p-1 mb-5 mx-3">
    //     {(["Market", "Limit"] as const).map((type) => (
    //       <button
    //         type="button"
    //         key={type}
    //         onClick={() => setOrderType(type)}
    //         className={`flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 
    //           ${
    //             orderType === type
    //               ? "text-blue-500 font-medium text-md border-b border-b-blue-500 px-4 py-1 transition-all duration-200"
    //               : "text-gray-400 hover:text-white transition-colors duration-200 text-md"
    //           }`}
    //       >
    //         {type}
    //       </button>
    //     ))}
    //   </div>
    //   {/* Trading Type Selector */}
    //   <div className="flex bg-[#1C1C28] p-1 mx-4 border border-gray-700 rounded-md ">
    //     {(["Long", "Short"] as const).map((type) => (
    //       <button
    //         key={type}
    //         onClick={() => setActiveTab(type)}
    //         className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 
    //           ${
    //             tradeDirection === type
    //               ? "text-gray-900 font-medium text-md bg-blue-500 rounded-md px-4 py-1 transition-all duration-200"
    //               : "text-white transition-colors duration-200 text-md"
    //           }`}
    //       >
    //         {type}
    //       </button>
    //     ))}
    //   </div>

    //   <div className="p-4 space-y-4">
    //     {/* margin Input */}
    //     <MarginInput
    //       value={margin}
    //       market={market}
    //       setMargin={setMargin}
    //       setError={setError}
    //       minCollateral={marketState.min_collateral}
    //     />
    //     {/* Limit Price Input */}
    //     {orderType == "Limit" ? (
    //       <PriceInput
    //         market={market}
    //         value={limitPrice}
    //         initialTick={marketState.current_tick}
    //         setLimitPrice={setLimitPrice}
    //       />
    //     ) : (
    //       <></>
    //     )}
    //     {/* Leverage Slider */}
    //     <LeverageSlider
    //       value={leverage}
    //       maxLeverage={marketState.max_leveragex10 / 10}
    //       setLeverage={setLeverage}
    //     />

    //     {/* Total */}
    //     <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
    //       <span className="text-gray-400">Total</span>
    //       <span className="text-white">
    //         {total()} {market.quoteAsset.symbol}
    //       </span>
    //     </div>
    //     <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
    //       <span className="text-gray-400">Market</span>
    //       <div className="flex items-center gap-2">
    //         <span className="text-white">
    //           {market.baseAsset.symbol}-{market.quoteAsset.symbol}
    //         </span>
    //         <Icon name="chevron down" className="text-gray-400" />
    //       </div>
    //     </div>
    //     {/* Styled ConnectWalletButton */}
    //     <div className=" flex justify-center">
    //       <ActionButton currentError={error} onClick={openOrder} />
    //     </div>
    //   </div>
    // </div>
    <div className={`p-3 rounded-lg`}>

      <div className="mb-5">
        <div className="flex p-1 mb-5 mx-3">
          {(["Market", "Limit"] as const).map((type) => (
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
              disabled={!isWalletConnected}
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
              onClick={() => setActiveTab(type)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  tradeDirection === type
                    ? "text-gray-900 font-medium text-md bg-blue-500 rounded-md px-4 py-1 transition-all duration-200"
                    : "text-white transition-colors duration-200 text-md"
                }`}
              disabled={!isWalletConnected}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
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
        {/* Leverage Slider */}
        <LeverageSlider
          value={leverage}
          maxLeverage={marketState.max_leveragex10 / 10}
          setLeverage={setLeverage}
        />

        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Total</span>
          <span className="text-white">
            {total()} {market.quoteAsset.symbol}
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Market</span>
          <div className="flex items-center gap-2">
            <span className="text-white">
              {market.baseAsset.symbol}-{market.quoteAsset.symbol}
            </span>
            <Icon name="chevron down" className="text-gray-400" />
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
            <div>Pool:{market.quoteAsset.symbol}</div>
            <div>Collateral in: Available: 0.00{market.baseAsset.symbol} </div>
            <div>Execution Price: - </div> 
            <div>Liq. Price: - </div> 
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

      {/* You will also need to implement the Positions, Orders, and Trades sections below the chart */}
      {/* These sections should also likely depend on isWalletConnected for displaying user-specific data */}
    </div>
  );
};
