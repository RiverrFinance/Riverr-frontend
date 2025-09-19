import { useEffect, useState } from "react";
import { MarketActor } from "../../../../utils/Interfaces/marketActor";
import { Market } from "../../../../lists/marketlist";
import { Agent } from "@dfinity/agent";
import { PositionParameters } from "../../../../utils/declarations/market/market.did";
import { formatUnits } from "ethers/lib/utils";
import { SECOND } from "../../../../utils/constants";
import { tickToPrice } from "../../utilFunctions";

// interface for new position structure
interface PositionData {
  position: PositionParameters;
  size: bigint;
  collateral: bigint;
  ratingPrice: bigint;
  markPrice: bigint;
  liquidationPrice: bigint;
}

interface Props {
  accountIndex: number;
  market: Market;
  positionData: PositionData;
  readWriteAgent: Agent | undefined;
  pnl: bigint;
}

export default function Position({
  accountIndex,
  market,
  positionData,
  readWriteAgent,
  pnl,
}: Props) {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3 * SECOND);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const closePosition = async () => {
    try {
      setIsClosing(true);
      const marketActor = new MarketActor(market.market_id, readWriteAgent);
      
      if ("Limit" in positionData.position.order_type) {
        await marketActor.closeLimitOrder(accountIndex);
      } else {
        await marketActor.closeMarketOrder(accountIndex);
      }

      setNotificationMessage("Position closed successfully!");
    } catch (error) {
      console.error("Error closing position:", error);
      setNotificationMessage("Failed to close position");
    } finally {
      setIsClosing(false);
      setShowNotification(true);
    }
  };

  const formatValue = (value: bigint, decimals: number = market.quoteAsset.decimals): string => {
    try {
      return formatUnits(value, decimals);
    } catch {
      return "0.00";
    }
  };

  const formatPnL = (value: bigint): { formatted: string; isPositive: boolean } => {
    const formatted = formatValue(value, 5);
    const numValue = parseFloat(formatted);
    return {
      formatted: `${numValue >= 0 ? '+' : ''}${formatted}`,
      isPositive: numValue >= 0
    };
  };

  const formatSize = (): string => {
    if (positionData.position.long) {
      const value = formatValue(positionData.size, market.baseAsset.decimals);
      return `${value} ${market.baseAsset.symbol}`;
    } else {
      const value = formatValue(positionData.size, market.quoteAsset.decimals);
      return `${value} ${market.quoteAsset.symbol}`;
    }
  };

  const getLeverageDisplay = (): string => {
    try {
      // leverage: (collateral + debt) / collateral
      const totalValue = positionData.position.collateral_value + positionData.position.debt_value;
      if (positionData.position.collateral_value === 0n) return "1x";
      
      const leverage = Number(totalValue) / Number(positionData.position.collateral_value);
      return `${leverage.toFixed(1)}x`;
    } catch {
      return "1x";
    }
  };

  const pnlData = formatPnL(pnl);

  return (
    <>
      <tr className="hover:bg-gray-800/30 transition-colors group">
        {/* Position Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <img
                src={market.baseAsset.logoUrl}
                alt={market.baseAsset.symbol}
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-token.png';
                }}
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-bold ${
                positionData.position.long ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {positionData.position.long ? 'L' : 'S'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-white font-medium text-xs sm:text-sm truncate">
                  {market.baseAsset.symbol}
                </span>
                <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded font-medium ${
                  positionData.position.long 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {getLeverageDisplay()}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
                {positionData.position.long ? 'Long' : 'Short'}
              </div>
            </div>
          </div>
        </td>

        {/* Size Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4 text-right">
          <div className="text-white font-medium text-xs sm:text-sm">
            {formatSize()}
          </div>
        </td>

        {/* Collateral Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4 text-right">
          <div className="text-white font-medium text-xs sm:text-sm">
            ${formatValue(positionData.collateral)}
          </div>
        </td>

        {/* Rating Price Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4 text-right hidden md:table-cell">
          <div className="text-white font-medium text-xs sm:text-sm">
            ${tickToPrice(positionData.ratingPrice)}
          </div>
        </td>

        {/* Mark Price Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4 text-right">
          <div className="text-white font-medium text-xs sm:text-sm">
            ${tickToPrice(positionData.markPrice)}
          </div>
        </td>

        {/* Liquidation Price Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4 text-right hidden lg:table-cell">
          <div className="text-white font-medium text-xs sm:text-sm">
            ${tickToPrice(positionData.liquidationPrice)}
          </div>
        </td>

        {/* PnL Column */}
        {/* <td className="px-2 sm:px-3 py-3 sm:py-4 text-right hidden xl:table-cell">
          <div className={`font-medium text-xs sm:text-sm ${pnlData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {pnlData.formatted}
          </div>
        </td> */}

        {/* Actions Column */}
        <td className="px-2 sm:px-3 py-3 sm:py-4 text-center">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={closePosition}
              disabled={isClosing}
              className="p-1.5 sm:p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       border border-transparent hover:border-red-500/20"
              title="Close Position"
            >
              {isClosing ? (
                <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="sr-only">Close Position</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Rating Price */}
      <tr className="md:hidden border-t border-gray-800/30">
        <td colSpan={8} className="px-3 py-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Rating Price:</span>
            <span className="text-white font-medium">${tickToPrice(positionData.ratingPrice)}</span>
          </div>
        </td>
      </tr>

      {/* Liquidation Price */}
      <tr className="lg:hidden border-t border-gray-800/30">
        <td colSpan={8} className="px-3 py-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Liquidation Price:</span>
            <span className="text-white font-medium">${tickToPrice(positionData.liquidationPrice)}</span>
          </div>
        </td>
      </tr>

      {/* PnL */}
      <tr className="xl:hidden border-t border-gray-800/30">
        <td colSpan={8} className="px-3 py-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">PnL:</span>
            <span className={`font-medium ${pnlData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {pnlData.formatted}
            </span>
          </div>
        </td>
      </tr>

      {/* Notification Toast */}
      {showNotification && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
              <div className={`px-4 py-3 rounded-lg shadow-lg border ${
                notificationMessage.includes("success")
                  ? "bg-green-900/90 border-green-500/50 text-green-100"
                  : "bg-red-900/90 border-red-500/50 text-red-100"
              } backdrop-blur-sm`}>
                <div className="flex items-center space-x-2">
                  {notificationMessage.includes("success") ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="font-medium text-sm">{notificationMessage}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}