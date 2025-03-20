import React, { useEffect, useState } from "react";
import { Icon } from "semantic-ui-react";
import { Market } from "../../../types/types";
import { Identity } from "@dfinity/agent";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { AnonymousIdentity, HttpAgent } from "@dfinity/agent";
import { StateDetails } from "../../../utils/declarations/market/market.did";
import { VaultActor } from "../../../utils/Interfaces/vaultActor";
import { LeverageSlider } from "./LeverageSlider";
import { Parameters, TradeError } from "../types";
import { formatPrice } from "../utilFunctions";
import { LimitPriceInput } from "./LimitPriceInput";
import { Principal } from "@dfinity/principal";
import { TokenActor } from "../../../utils/Interfaces/tokenActor";

// const _BASE_PRICE: bigint = 1000_000_000n;
// const _PRICE_DECIMAL: bigint = 1000_000_000n;

//@ts-ignore
if (typeof global === "undefined") {
  (window as any).global = window;
}

const buttonText = (error: TradeError) => {
  if (error == "Connect Wallet") {
    return "Connect Wallet";
  } else if (error == "Insufficient Balance") {
    return "Insufficient Balance";
  } else if (error == "Min Collateral is") {
    return "Min Collateral is";
  } else if (error == "Collateral Exceeded") {
    return "Collateral Exceeded";
  } else {
    return "Open Position";
  }
};

export interface TradingPanelProps {
  market: Market;
  identity: Identity | null;
  onOrderSubmit?: () => void;
}
////
export const TradingPanel: React.FC<TradingPanelProps> = ({
  market,
  identity,
}) => {
  const [userMarginBalance, setUserMarginBalance] = useState<bigint>(0n);
  const [agent, setAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [error, setError] = useState<TradeError>("");
  const [paramters, setParamters] = useState<Parameters>({
    collateral: "",
    leverage: 1,
    orderPrice: "",
    orderType: "Market",
    direction: "Long",
  });

  const [marketState, setMarketState] = useState<StateDetails>({
    max_leveragex10: 100,
    not_paused: true,
    current_tick: 0n,
    base_token_multiple: 20,
    min_collateral: 0n,
  });

  //const marketActor = new MarketActor(market.market_id, agent);
  const tokenActor = new TokenActor("4yl7m-3qaaa-aaaaf-qanlq-cai", agent);

  const updateCollateral = async (value: string) => {
    let collateral;

    if (identity == null || value == "") {
      collateral = value;
      setError(identity == null ? "Connect Wallet" : "");
    } else {
      collateral = Number(value);
      let mulValue =
        BigInt(collateral) * BigInt(10) ** BigInt(market.quoteAsset.decimal);

      if (userMarginBalance < BigInt(mulValue)) {
        setError("Insufficient Balance");
      } else if (BigInt(mulValue) < marketState.min_collateral) {
        setError("Min Collateral is");
      } else {
        setError("");
      }
    }

    setParamters({
      ...paramters,
      collateral: collateral.toString(),
    });
  };

  const test = async () => {
    console.log(await tokenActor.name());
  };

  const updateOrderPrice = async (value: string) => {
    setParamters({ ...paramters, orderPrice: value });
  };

  const updateLeverage = (value: number) => {
    setParamters({
      ...paramters,
      leverage: value,
    });
  };

  const updateStatezDetails = async () => {
    try {
      let marketActor = new MarketActor(market.market_id, agent);
      let details = await marketActor.getStateDetails();
      setMarketState(details);
    } catch (e) {}
  };

  const totalValue = (): string => {
    if (paramters.collateral == "") {
      return "--";
    }
    return formatPrice(
      Number(paramters.collateral) * Number(paramters.leverage)
    ).toString();
  };

  // first yupdate
  useEffect(() => {
    const updateAgent = async () => {
      let setIdentity = identity != null ? identity : new AnonymousIdentity();
      let initAgent = await HttpAgent.create({
        host: "https://ico.app",
        identity: setIdentity,
      });
      setAgent(initAgent);
    };
    updateAgent();
  }, [identity]);

  return (
    <div className={`bg-[#13131F] p-3 rounded-lg border border-gray-800`}>
      <div className="flex p-1 mb-5 mx-3">
        {(["Market", "Limit"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setParamters({ ...paramters, orderType: type })}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 
              ${
                paramters.orderType === type
                  ? "text-blue-500 font-medium text-md border-b border-b-blue-500 px-4 py-1 transition-all duration-200"
                  : "text-gray-400 hover:text-white transition-colors duration-200 text-md"
              }`}
          >
            {type}
          </button>
        ))}
      </div>
      {/* Trading Type Selector */}
      <div className="flex p-1 bg-[#1C1C28] p-1 mx-4 border border-gray-700 rounded-md ">
        {(["Long", "Short"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setParamters({ ...paramters, direction: type })}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 
              ${
                paramters.direction === type
                  ? "text-gray-900 font-medium text-md bg-blue-500 rounded-md px-4 py-1 transition-all duration-200"
                  : "text-white transition-colors duration-200 text-md"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Pay Input */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Collateral</span>
            <span className="text-gray-400">
              Available: {userMarginBalance.toString()}{" "}
              {market.quoteAsset.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
            <input
              type="number"
              value={paramters.collateral}
              onChange={(e) => {
                let { value } = e.target;
                updateCollateral(value);
              }}
              className="flex-1 bg-transparent text-white outline-none text-lg"
              placeholder="0.00"
            />
            <div>{market.quoteAsset.symbol}</div>
          </div>
        </div>

        {/* Receive Input */}

        {paramters.orderType == "Limit" ? (
          <LimitPriceInput
            orderPrice={paramters.orderPrice}
            updateAction={updateOrderPrice}
            market={market}
          />
        ) : (
          <></>
        )}

        {/* Leverage Slider */}
        <LeverageSlider
          leverage={paramters.leverage}
          updateAction={updateLeverage}
          maxLevaragex10={marketState.max_leveragex10}
        />

        {/* Total */}
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Total</span>
          <span className="text-white">
            {totalValue()} {market.baseAsset.symbol}
          </span>
        </div>

        {/* Pool Selection */}
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Market</span>
          <div className="flex items-center gap-2">
            <span className="text-white">
              {market.baseAsset.symbol}-{market.quoteAsset.symbol}
            </span>
            <Icon name="chevron down" className="text-gray-400" />
          </div>
        </div>

        {/* Styled ConnectWalletButton */}
        <div className=" flex justify-center">
          {/* <button onClick={stateDetails}>test it now </button> */}
          <button onClick={test} className="py-3 px-24">
            {buttonText(error)}
          </button>
        </div>
      </div>
    </div>
  );
};
