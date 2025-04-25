import { Agent, HttpAgent } from "@dfinity/agent";
import { useAgent } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import {
  PositionParameters,
  PositionStatus,
} from "../../../utils/declarations/market/market.did";

import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import TradePosition from "./TradePosition";
import { ICP_API_HOST } from "../../../utils/utilFunction";

const maxSubAccount = 4;

interface Props {
  market: Market;
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
}

export default function PositionsTerminal({
  market,
  readWriteAgent,
  readAgent,
}: Props) {
  // const readWriteAgent = useAgent();
  // const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [currentTick, setCurrentTick] = useState<bigint>(0n);
  const [currentTab, setCurrentTab] = useState<"Orders" | "Positions">(
    "Positions"
  );
  const [orders, setOrdersIndex] = useState<[number, PositionParameters][]>([]);
  const [positions, setPositionIndex] = useState<
    [number, PositionParameters][]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (readWriteAgent) {
        fetchAndSeperate();
      } else {
        setOrdersIndex([]);
        setPositionIndex([]);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  const fetchAndSetCurrentTick = async () => {
    try {
      let marketActor = new MarketActor(market.market_id, readAgent);
      let { current_tick } = await marketActor.getStateDetails();
      setCurrentTick(current_tick);
    } catch {}
  };

  /**
   *
   * This function fetches the users order and positions and seperate them accordingly
   * NOtE: The positionsare orders that have been executed
   */

  const fetchAndSeperate = async () => {
    try {
      if (readWriteAgent && market.market_id) {
        let user = await readWriteAgent.getPrincipal();
        const marketActor = new MarketActor(market.market_id, readAgent);
        let orderList: [number, PositionParameters][],
          positionsList: [number, PositionParameters][];
        for (let i = 0; i <= maxSubAccount; i++) {
          let details: [[PositionParameters, PositionStatus]] | [] =
            await marketActor.getaccountPositiondetails(user, i);
          if (details.length == 0) {
            continue;
          }
          let [position, status] = details[0];
          if ("FILLED" in status) {
            positionsList.push([i, position]);
          } else {
            orderList.push([i, position]);
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
        return (
          <TradePosition account_index={index} market={market} order={order} />
        );
      });
    } else {
      return orders.map(([index, order]) => {
        return (
          <TradePosition account_index={index} market={market} order={order} />
        );
      });
    }
  };

  return <div>{returnElement()}</div>;
}
