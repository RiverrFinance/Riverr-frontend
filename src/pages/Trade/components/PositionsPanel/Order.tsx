import { useEffect, useState } from "react";
import { MarketActor } from "../../../../utils/Interfaces/marketActor";
import { Market } from "../../../../lists/marketlist";
import { Agent } from "@dfinity/agent";
import { formatUnits } from "ethers/lib/utils";
import { SECOND } from "../../../../utils/constants";
import { tickToPrice } from "../../utilFunctions";

interface OrderData {
  market: string;
  type: 'Market' | 'Limit';
  size: bigint;
  maxPrice: bigint;
}

interface Props {
  accountIndex: number;
  market: Market;
  orderData: OrderData;
  readWriteAgent: Agent | undefined;
  pnl: bigint;
}

export default function Order({
  accountIndex,
  market,
  orderData,
  readWriteAgent,
  pnl,
}: Props) {
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
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

  const cancelOrder = async () => {
    try {
      setIsCancelling(true);
      const marketActor = new MarketActor(market.market_id, readWriteAgent);
      
      if (orderData.type === 'Limit') {
        await marketActor.closeLimitOrder(accountIndex);
      } else {
        await marketActor.closeMarketOrder(accountIndex);
      }

      setNotificationMessage("Order cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling order:", error);
      setNotificationMessage("Failed to cancel order");
    } finally {
      setIsCancelling(false);
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

  const formatSize = (): string => {
    const value = formatValue(orderData.size, market.quoteAsset.decimals);
    return `${value} ${market.quoteAsset.symbol}`;
  };

  const getOrderTypeColor = (type: 'Market' | 'Limit'): string => {
    return type === 'Market' 
      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getOrderTypeIcon = (type: 'Market' | 'Limit'): JSX.Element => {
    if (type === 'Market') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  const formatMaxPrice = (): string => {
    if (orderData.type === 'Market' || orderData.maxPrice === 0n) {
      return 'Market';
    }
    return `${tickToPrice(orderData.maxPrice)}`;
  };

  return (
    <>
      <tr className="hover:bg-gray-800/30 transition-colors group">
        {/* Market Column */}
        <td className="px-3 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={market.baseAsset.logoUrl}
                alt={market.baseAsset.symbol}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-token.png';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium text-sm truncate">
                  {market.baseAsset.symbol}
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  /{market.quoteAsset.symbol}
                </span>
              </div>
            </div>
          </div>
        </td>

        {/* Type Column */}
        <td className="px-3 py-4 hidden md:table-cell">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getOrderTypeColor(orderData.type)}`}>
            {getOrderTypeIcon(orderData.type)}
            <span>{orderData.type}</span>
          </div>
        </td>

        {/* Size Column */}
        <td className="px-3 py-4 text-right">
          <div className="text-white font-medium text-sm">
            {formatSize()}
          </div>
          <div className="text-xs text-gray-400 md:hidden">
            {orderData.type}
          </div>
        </td>

        {/* Max Price Column */}
        <td className="px-3 py-4 text-right">
          <div className="text-white font-medium text-sm">
            {formatMaxPrice()}
          </div>
        </td>

        {/* Actions Column */}
        <td className="px-3 py-4 text-center">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={cancelOrder}
              disabled={isCancelling}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       border border-transparent hover:border-red-500/20"
              title="Cancel Order"
            >
              {isCancelling ? (
                <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="sr-only">Cancel Order</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Notification Toast */}
      {showNotification && (
        <tr>
          <td colSpan={5} className="p-0">
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
