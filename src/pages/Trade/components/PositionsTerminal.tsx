import { Agent, HttpAgent } from "@dfinity/agent";
import { useAuth } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import {
  PositionParameters,
  PositionStatus,
} from "../../../utils/declarations/market/market.did";

import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import TradePosition from "./TradePosition";

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
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<"Orders" | "Positions">(
    "Positions"
  );
  const [orders, setOrdersIndex] = useState<
    [number, PositionParameters, bigint][]
  >([]);
  const [positions, setPositionIndex] = useState<
    [number, PositionParameters, bigint][]
  >([]);

  useEffect(() => {
    let interval: undefined | number;
    if (market.market_id != undefined) {
      if (readWriteAgent != undefined) {
        interval = setInterval(() => {
          fetchAndSeperate();
        }, 10000);
        return;
      }
    }
    setOrdersIndex([]);
    setPositionIndex([]);

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent, market]);

  /**
   *
   * This function fetches the users order and positions and seperate them accordingly
   * NOtE: The positionsare orders that have been executed
   */
  const fetchAndSeperate = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readAgent);
      let orderList: [number, PositionParameters, bigint][],
        positionsList: [number, PositionParameters, bigint][];
      for (let i = 0; i <= maxSubAccount; i++) {
        let details: [[PositionParameters, PositionStatus, bigint]] | [] =
          await marketActor.getaccountPositiondetails(user.principal, i);
        if (details.length == 0) {
          continue;
        }
        let [position, status, pnl] = details[0];
        if ("FILLED" in status) {
          positionsList.push([i, position, pnl]);
        } else {
          orderList.push([i, position, pnl]);
        }
      }
      setOrdersIndex(orderList);
      setPositionIndex(positionsList);
    } catch {}
  };

  const returnElement = (): JSX.Element[] => {
    if (currentTab == "Positions") {
      return positions.map(([index, order, pnl]) => {
        return (
          <TradePosition
            pnl={pnl}
            accountIndex={index}
            market={market}
            order={order}
            readAgent={readAgent}
            readWriteAgent={readWriteAgent}
          />
        );
      });
    } else {
      return orders.map(([index, order, pnl]) => {
        return (
          <TradePosition
            pnl={pnl}
            accountIndex={index}
            market={market}
            order={order}
            readAgent={readAgent}
            readWriteAgent={readWriteAgent}
          />
        );
      });
    }
  };

  return <div>{returnElement()}</div>;
}
