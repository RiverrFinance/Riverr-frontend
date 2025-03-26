import { HttpAgent } from "@dfinity/agent";
import { useAgent } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { PositionDetails } from "../../../utils/declarations/market/market.did";
import { AgentError } from "@dfinity/agent/lib/cjs/errors";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import TradePosition from "./TradePosition";
import { ICP_API_HOST } from "../../../utils/utilFunction";

const maxSubAccount = 4;

interface Props {
  market: Market;
}

export default function PositionsTerminal({ market }: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [currentTab, setCurrentTab] = useState<"Orders" | "Positions">(
    "Positions"
  );
  const [orders, setOrdersIndex] = useState<[number, PositionDetails][]>([]);
  const [positions, setPositionIndex] = useState<[number, PositionDetails][]>(
    []
  );

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndSeperate();
    }, 10000);
  }, []);

  const getSubaccount = async (index: number) => {
    try {
      const user = await readWriteAgent.getPrincipal();
      const marketActor = new MarketActor(market.market_id, readAgent);
      const subaccount = await marketActor.getUserAccount(user, index);
      return subaccount;
    } catch (err) {
      throw err;
    }
  };

  /**
   *
   * This function fetches the users order and positions and seperate them accordingly
   * NOtE: The positionsare orders that have been executed
   */

  const fetchAndSeperate = async () => {
    try {
      if (readWriteAgent && market.market_id) {
        const marketActor = new MarketActor(market.market_id, readAgent);
        let orderList: [number, PositionDetails][],
          positionsList: [number, PositionDetails][];
        for (let i = 0; i <= maxSubAccount; i++) {
          let subaccount = await getSubaccount(i);
          try {
            const position = await marketActor.getAccountPosition(subaccount);
            if ("Limit" in position.order_type) {
              orderList.push([i, position]);
            } else {
              positionsList.push([i, position]);
            }
          } catch {
            continue;
          }
        }
        setOrdersIndex(orderList);
        setPositionIndex(positionsList);
      }
    } catch {}
  };

  const returnElement = (): JSX.Element[] => {
    if (currentTab == "Positions") {
      return positions.map(([index, order]) => {
        return <TradePosition account_index={index} market={market} />;
      });
    } else {
      return orders.map(([index, order]) => {
        return <TradePosition account_index={index} market={market} />;
      });
    }
  };

  return <div>{returnElement()}</div>;
}
