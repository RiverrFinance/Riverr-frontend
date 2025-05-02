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
    if (market.market_id) {
      if (readWriteAgent) {
        fetchAndSeperate();
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

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Tabs */}
      <div className="relative p-1">
        <div className="flex relative z-10">
          {(["Positions", "Orders"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300"
            >
              <span
                className={`relative z-10 ${
                  currentTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </span>
            </button>
          ))}
        </div>
        {/* Sliding background */}
        <div
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-0px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
          style={{
            transform: `translateX(${currentTab === "Positions" ? "0%" : "100%"})`,
          }}
        />
      </div>

      {/* Positions/Orders List */}
      <div className="flex flex-col gap-3">
        {positions.length === 0 && orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No {currentTab.toLowerCase()} found
          </div>
        ) : (
          returnElement()
        )}
      </div>
    </div>
  );
}
