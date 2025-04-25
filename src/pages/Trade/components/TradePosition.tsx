import { useAgent } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../../utils/utilFunction";
import { PositionParameters } from "../../../utils/declarations/market/market.did";

interface Props {
  account_index: number;
  market: Market;
  order: PositionParameters;
}

export default function TradePosition({ account_index, market }: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());

  useEffect(() => {}, []);

  return (
    <div>
      {" "}
      <div></div>
    </div>
  );
}
