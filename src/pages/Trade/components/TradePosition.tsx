import { useAgent } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import { Agent, HttpAgent } from "@dfinity/agent";
import { PositionParameters } from "../../../utils/declarations/market/market.did";

interface Props {
  accountIndex: number;
  market: Market;
  order: PositionParameters;
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  pnl: bigint;
}

export default function TradePosition({
  accountIndex,
  market,
  readWriteAgent,
  readAgent,
  pnl,
}: Props) {
  useEffect(() => {}, []);

  const closePosition = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readWriteAgent);
      let txResponse: bigint = await marketActor.closePosition(accountIndex);
    } catch {}
  };

  return (
    <div>
      {" "}
      <div></div>
    </div>
  );
}
