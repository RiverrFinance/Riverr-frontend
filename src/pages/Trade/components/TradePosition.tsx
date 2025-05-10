import { useState } from "react";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import { Agent, HttpAgent } from "@dfinity/agent";
import { PositionParameters } from "../../../utils/declarations/market/market.did";
import { Icon, Popup } from "semantic-ui-react";
import { formatUnits } from "ethers/lib/utils";
import { ONE_PERCENT } from "../../../utils/constants";
import { tickToPrice } from "../utilFunctions";

interface Props {
  accountIndex: number;
  markTick: bigint;
  market: Market;
  order: PositionParameters;
  readWriteAgent: Agent | undefined;
  pnl: bigint;
}

export default function TradePosition({
  accountIndex,
  market,
  order,
  readWriteAgent,
  pnl,
  markTick,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const closePosition = async () => {
    try {
      setIsClosing(true);
      const marketActor = new MarketActor(market.market_id, readWriteAgent);
      await marketActor.closePosition(accountIndex);
      setNotificationMessage("Position closed successfully!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      setNotificationMessage("Failed to close position");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsClosing(false);
    }
  };

  const formatPnL = (value: bigint): string => {
    const formatted = formatUnits(value, 5);
    return formatted;
  };

  const getPositionDetails = () => {
    return {
      collateralValue: formatUnits(order.collateral_value),
      debtValue: formatUnits(order.debt_value),
      volumeShare: formatUnits(order.volume_share),
      entryPrice: formatUnits(order.entry_tick),
      interestRate: (order.interest_rate * 100).toFixed(2),
      openTime: new Date(Number(order.timestamp) * 1000).toLocaleString(),
      positionType: order.long ? "Long" : "Short",
      orderType: Object.keys(order.order_type)[0],
    };
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
        <td className="p-4">{tickToPrice(order.entry_tick)}</td>
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
