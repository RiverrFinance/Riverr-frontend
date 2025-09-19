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
import Order from "./Order";
import { SECOND } from "../../../../utils/constants";
import { TrendingUp, TrendingDown, BarChart3, Clock, ChevronDown } from "lucide-react";

const maxSubAccount = 4;

interface OrderData {
  market: string;
  type: 'Market' | 'Limit';
  size: bigint;
  maxPrice: bigint;
}

interface PositionData {
  position: PositionParameters;
  size: bigint;
  collateral: bigint;
  ratingPrice: bigint; 
  markPrice: bigint;
  liquidationPrice: bigint; 
}

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
  
  const [orders, setOrders] = useState<[number, OrderData, bigint][]>([]);
  const [positions, setPositions] = useState<[number, PositionData, bigint][]>([]);
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
        setOrders([]);
        setPositions([]);
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent, market]);

  const fetchAndSeperate = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readAgent);
      let orderList: [number, OrderData, bigint][] = [];
      let positionsList: [number, PositionData, bigint][] = [];
      
      for (let i = 0; i <= maxSubAccount; i++) {
        let details: [[PositionParameters, PositionStatus, bigint]] | [] =
          await marketActor.getaccountPositiondetails(user.principal, i);
          
        if (details.length == 0) {
          continue;
        }
        
        let [position, status, pnl] = details[0];
        
        if ("FILLED" in status) {
          const positionData: PositionData = {
            position,
            size: position.collateral_value + position.debt_value, 
            collateral: position.collateral_value,
            ratingPrice: position.entry_tick, 
            markPrice: lowestSellOffer,
            liquidationPrice: calculateLiquidationPrice(position), 
          };
          positionsList.push([i, positionData, pnl]);
        } else {
          const orderData: OrderData = {
            market: market.baseAsset.symbol + "/" + market.quoteAsset.symbol,
            type: "Limit" in position.order_type ? 'Limit' : 'Market',
            size: position.collateral_value + position.debt_value, 
            maxPrice: position.entry_tick, 
          };
          orderList.push([i, orderData, pnl]);
        }
      }
      
      setOrders(orderList);
      setPositions(positionsList);
    } catch {
      return;
    }
  };

  const calculateLiquidationPrice = (position: PositionParameters): bigint => {
    const leverageMultiplier = position.long ? 90n : 110n; 
    return (position.entry_tick * leverageMultiplier) / 100n;
  };

  const fetchSetBestOffers = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readAgent);
      const [_, lso] = await marketActor.getBestOffersTicks();
      setLowestSellOffer(lso);
    } catch {}
  };

  const renderPositions = (): JSX.Element[] => {
    return positions.map(([index, positionData, pnl]) => {
      return (
        <Position
          key={`position-${index}`}
          accountIndex={index}
          market={market}
          positionData={positionData}
          readWriteAgent={readWriteAgent}
          pnl={pnl}
        />
      );
    });
  };

  const renderOrders = (): JSX.Element[] => {
    return orders.map(([index, orderData, pnl]) => {
      return (
        <Order
          key={`order-${index}`}
          accountIndex={index}
          market={market}
          orderData={orderData}
          readWriteAgent={readWriteAgent}
          pnl={pnl}
        />
      );
    });
  };

  const getTableHeaders = () => {
    if (currentTab === "Positions") {
      return (
        <tr className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          <th className="px-4 sm:px-6 py-4 text-left font-medium">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:block">Position</span>
              <span className="sm:hidden">Pos</span>
            </div>
          </th>
          <th className="px-3 py-4 text-right font-medium">
            <div className="hidden md:block">Size</div>
            <div className="md:hidden">Size</div>
          </th>
          <th className="px-3 py-4 text-right font-medium">
            <div className="hidden lg:block">Collateral</div>
            <div className="lg:hidden hidden md:block">Coll</div>
            <div className="md:hidden">Col</div>
          </th>
          <th className="px-3 py-4 text-right font-medium hidden md:table-cell">
            <div className="hidden lg:block">Rating Price</div>
            <div className="lg:hidden">Rating</div>
          </th>
          <th className="px-3 py-4 text-right font-medium">
            <div className="hidden sm:block">Mark Price</div>
            <div className="sm:hidden">Mark</div>
          </th>
          <th className="px-3 py-4 text-right font-medium hidden sm:table-cell">
            <div className="hidden lg:block">Liq. Price</div>
            <div className="lg:hidden">Liq</div>
          </th>
          <th className="px-3 py-4 text-right font-medium hidden lg:table-cell">PnL</th>
          <th className="px-3 py-4 text-center font-medium w-12">
            <div className="hidden sm:block">Actions</div>
            <div className="sm:hidden">•••</div>
          </th>
        </tr>
      );
    } else {
      return (
        <tr className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          <th className="px-4 sm:px-6 py-4 text-left font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:block">Market</span>
              <span className="sm:hidden">Mkt</span>
            </div>
          </th>
          <th className="px-3 py-4 text-left font-medium hidden md:table-cell">Type</th>
          <th className="px-3 py-4 text-right font-medium">Size</th>
          <th className="px-3 py-4 text-right font-medium">
            <div className="hidden lg:block">Max Price</div>
            <div className="lg:hidden">Price</div>
          </th>
          <th className="px-3 py-4 text-center font-medium w-12">
            <div className="hidden sm:block">Actions</div>
            <div className="sm:hidden">•••</div>
          </th>
        </tr>
      );
    }
  };

  const getEmptyMessage = () => {
    return currentTab === "Positions" ? "No open positions" : "No pending orders";
  };

  const getTabIcon = (tab: "Positions" | "Orders") => {
    if (tab === "Positions") {
      return <BarChart3 className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  const getTotalPnL = () => {
    const totalPnL = positions.reduce((sum, [_, __, pnl]) => sum + Number(pnl), 0);
    return totalPnL;
  };

  const getTotalCollateral = () => {
    const totalCollateral = positions.reduce((sum, [_, positionData]) => sum + Number(positionData.collateral), 0);
    return totalCollateral;
  };

  return (
    <div className=" pb-6 px-0 rounded-2xl overflow-visible h-full">
      {/* Main Container */}
      <div className="h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 p-1 sm:p-2">
          {/* Tab Selector */}
          <div className="relative p-2">
            <div className="flex w-96 relative z-10">
              {(["Positions", "Orders"] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className="flex items-center gap-2 flex-1 py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium relative transition-colors duration-300"
                >
                  {getTabIcon(tab)}
                  <span
                    className={`relative z-10 ${
                      currentTab === tab
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="hidden sm:inline">{tab}</span>
                    <span className="sm:hidden">{tab === "Positions" ? "Pos" : "Orders"}</span>
                  </span>
                  {/* Count Badge */}
                  {(currentTab === tab) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-400/20 text-blue-300 border border-blue-400/30">
                      {currentTab === "Positions" ? positions.length : orders.length}
                    </span>
                  )}
                </button>
              ))}

              {/* Sliding background */}
              <div
                className={`absolute top-0 h-full transition-transform duration-300 ease-in-out w-1/2 bg-[#0300ad18] border-b-2 border-[#0300AD] rounded-lg`}
                style={{
                  transform: `translateX(${
                    currentTab === "Orders" ? "100%" : "0%"
                  })`,
                }}
              />
            </div>
          </div>

          {/* Positions Tab */}
          {currentTab === "Positions" && positions.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total Positions</p>
                    <p className="text-lg font-bold text-white">{positions.length}</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total PnL</p>
                    <p className={`text-lg font-bold ${getTotalPnL() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {getTotalPnL() >= 0 ? '+' : ''}${getTotalPnL().toFixed(2)}
                    </p>
                  </div>
                  {getTotalPnL() >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total Collateral</p>
                    <p className="text-lg font-bold text-white">${getTotalCollateral().toFixed(2)}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {market.quoteAsset.symbol}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto scrollbar-custom scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
            <table className="w-full min-w-[600px]">
              <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 border-b border-gray-700/50">
                {getTableHeaders()}
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {(currentTab === "Positions" ? positions.length === 0 : orders.length === 0) ? (
                  <tr>
                    <td colSpan={currentTab === "Positions" ? 8 : 5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700/50">
                          {currentTab === "Positions" ? (
                            <BarChart3 className="w-8 h-8 text-gray-500" />
                          ) : (
                            <Clock className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-400 font-medium text-lg">{getEmptyMessage()}</p>
                          <p className="text-gray-500 text-sm max-w-sm">
                            {currentTab === "Positions" 
                              ? "Your positions will appear here when you open trades. Start by placing an order in the trading panel."
                              : "Your pending orders will appear here. Create a limit order to get started."
                            }
                          </p>
                        </div>
                        <div className="mt-6">
                          <div className="text-xs text-gray-600 bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700/30">
                            Market: {market.baseAsset.symbol}/{market.quoteAsset.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTab === "Positions" ? renderPositions() : renderOrders()
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* {(positions.length > 0 || orders.length > 0) && (
          <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Market: {market.baseAsset.symbol}/{market.quoteAsset.symbol}</span>
                <span>•</span>
                <span>Auto-refresh: 10s</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}