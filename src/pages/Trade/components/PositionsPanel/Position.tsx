import { useEffect, useState } from "react";
import { MarketActor } from "../../../../utils/Interfaces/marketActor";
import { Market } from "../../../../lists/marketlist";
import { Agent } from "@dfinity/agent";
import { PositionParameters } from "../../../../utils/declarations/market/market.did";
import { Icon } from "semantic-ui-react";
import { formatUnits } from "ethers/lib/utils";
import { ONE_PERCENT, SECOND } from "../../../../utils/constants";
import { tickToPrice } from "../../utilFunctions";

interface Props {
  accountIndex: number;
  markTick: bigint;
  market: Market;
  order: PositionParameters;
  readWriteAgent: Agent | undefined;
  pnl: bigint;
}

export default function Position({
  accountIndex,
  market,
  order,
  readWriteAgent,
  pnl,
  markTick,
}: Props) {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");

  useEffect(() => {
    if (showNotification) {
      setTimeout(() => {
        setShowNotification(false);
      }, 3 * SECOND);
    }
  }, [showNotification]);

  const closePosition = async () => {
    try {
      setIsClosing(true);
      const marketActor = new MarketActor(market.market_id, readWriteAgent);
      if ("Limit" in order.order_type) {
        await marketActor.closeLimitOrder(accountIndex);
      } else {
        await marketActor.closeMarketOrder(accountIndex);
      }

      setNotificationMessage("Position closed successfully!");
    } catch (error) {
      alert(error);
      setNotificationMessage("Failed to close position");
    } finally {
      setIsClosing(false);
      setShowNotification(true);
    }
  };

  const formatPnL = (value: bigint): string => {
    const formatted = formatUnits(value, 5);
    return formatted;
  };

  const currentCollateral = () => {
    // % of initial collatreal remaining
    let intialCollateral = order.collateral_value;
  };

  const positionSize = (): string => {
    if (order.long) {
      let value =
        ((order.collateral_value + order.debt_value) * 100n * ONE_PERCENT) /
        order.entry_tick;
      return `${formatUnits(value, market.quoteAsset.decimals)} ${
        market.baseAsset.symbol
      }`;
    } else {
      return `${formatUnits(
        order.collateral_value + order.debt_value,
        market.quoteAsset.decimals
      )} ${market.quoteAsset.symbol}`;
    }
  };

  return (
    <>
      <tr className="bg-[#18191d72] border border-[#27272b] rounded-lg">
        <td className="p-4">
          <div className="flex items-center gap-2">
            <img
              src={market.baseAsset.logoUrl}
              alt={market.baseAsset.symbol}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm">{order.long ? "Long" : "Short"}</span>
          </div>
        </td>
        <td className="p-4">{positionSize()}</td>
        <td className="p-4">
          {formatUnits(order.collateral_value, market.quoteAsset.decimals)}{" "}
          {market.quoteAsset.symbol}
        </td>
        <td className="p-4">{tickToPrice(order.entry_tick * 100n)}</td>
        <td className="p-4">{tickToPrice(markTick)}</td>
        <td className="p-4 text-right">
          <button
            type="button"
            onClick={closePosition}
            className="p-2 rounded-full text-sm transition-all duration-200"
          >
            <span>
              {isClosing ? (
                <Icon name="spinner" loading />
              ) : (
                <Icon name="close" />
              )}
            </span>
          </button>
        </td>
      </tr>
      {showNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notificationMessage.includes("success")
                ? "bg-green-500"
                : "bg-red-500"
            } text-white`}
          >
            {notificationMessage}
          </div>
        </div>
      )}
    </>
  );
}
