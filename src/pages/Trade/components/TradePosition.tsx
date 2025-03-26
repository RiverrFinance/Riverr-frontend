import { useAgent } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../../utils/utilFunction";
import { PositionDetails } from "../../../utils/declarations/market/market.did";
import CryptoJS from "crypto-js";
import { Principal } from "@dfinity/principal";
import { Subaccount } from "../../../utils/declarations/token/token.did";

interface Props {
  account_index: number;
  market: Market;
}

export default function TradePosition({ account_index, market }: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [positionDetails, setPositionDetails] =
    useState<PositionDetails | null>(null);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  return <div>{positionDetails == null ? <></> : <div></div>}</div>;
}
