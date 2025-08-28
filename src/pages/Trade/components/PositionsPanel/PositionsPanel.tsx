import { HttpAgent } from "@dfinity/agent";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import {
  PositionParameters,
  PositionStatus,
} from "../../../../utils/declarations/market/market.did";

import { MarketActor } from "../../../../utils/Interfaces/marketActor";
import { Market } from "../../../../lists/marketlist";
import Position from "./Position";
import { SECOND } from "../../../../utils/constants";

const maxSubAccount = 4;

interface Props {
  market: Market;
  readAgent: HttpAgent;
}

export default function PositionsPanel({ market, readAgent }: Props) {
  const readWriteAgent = useAgent();
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

  const [lowestSellOffer, setLowestSellOffer] = useState<bigint>(0n);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (market.market_id) {
      if (readWriteAgent) {
        fetchSetBestOffers();
        fetchAndSeperate();

        interval = setInterval(() => {
          fetchSetBestOffers();
          fetchAndSeperate();
        }, 10 * SECOND);
      } else {
        setOrdersIndex([]);
        setPositionIndex([]);
      }
    }

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
      let orderList: [number, PositionParameters, bigint][] = [];
      let positionsList: [number, PositionParameters, bigint][] = [];
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
    } catch {
      return;
    }
    45;
  };

  const fetchSetBestOffers = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readAgent);
      const [_, lso] = await marketActor.getBestOffersTicks();
      setLowestSellOffer(lso);
    } catch {}
  };

  const returnElement = (): JSX.Element[] => {
    if (currentTab == "Positions") {
      return positions.map(([index, order, pnl]) => {
        return (
          <Position
            markTick={lowestSellOffer}
            pnl={pnl}
            accountIndex={index}
            market={market}
            order={order}
            readWriteAgent={readWriteAgent}
          />
        );
      });
    } else {
      return orders.map(([index, order, pnl]) => {
        return (
          <Position
            markTick={lowestSellOffer}
            pnl={pnl}
            accountIndex={index}
            market={market}
            order={order}
            readWriteAgent={readWriteAgent}
          />
        );
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 pb-0 bg-transparent sticky top-0 z-10">
        <div className="relative p-1 sm:p-2 bg-transparent">
          <div className="flex relative z-10">
            {(["Positions", "Orders"] as const).map((tab) => (
              <button
                type="button"
                title="tabs"
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className="flex-1 py-2 sm:py-3 px-3 sm:px-6 text-xs sm:text-sm font-medium relative transition-colors duration-300"
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
          <div
            className="absolute top-1 sm:top-2 h-[calc(100%-8px)] sm:h-[calc(100%-16px)] w-[calc(50%-8px)] sm:w-[calc(50%-16px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-100 linear rounded-sm sm:rounded-lg"
            style={{
              transform: `translateX(${currentTab === "Positions" ? "0%" : "100%"})`,
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="h-full overflow-y-auto scrollbar-custom">
          <table className="w-full border-separate border-spacing-y-2 sm:border-spacing-y-4">
            <thead className="sticky top-0 z-10">
              <tr className="text-gray-400 text-xs sm:text-sm">
                <th className="p-3 sm:p-4 pb-4 sm:pb-6 text-left whitespace-nowrap min-w-[120px] sm:min-w-[150px]">
                  Position
                </th>
                <th className="p-3 sm:p-4 pb-4 sm:pb-6 text-left whitespace-nowrap min-w-[100px] sm:min-w-[120px]">
                  Size
                </th>
                <th className="p-3 sm:p-4 pb-4 sm:pb-6 text-left whitespace-nowrap min-w-[120px] sm:min-w-[150px]">
                  Collateral
                </th>
                <th className="p-3 sm:p-4 pb-4 sm:pb-6 text-left whitespace-nowrap min-w-[120px] sm:min-w-[150px]">
                  Entry Price
                </th>
                <th className="p-3 sm:p-4 pb-4 sm:pb-6 text-left whitespace-nowrap min-w-[120px] sm:min-w-[150px]">
                  Mark Price
                </th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {positions.length === 0 && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                    No {currentTab.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                returnElement()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
