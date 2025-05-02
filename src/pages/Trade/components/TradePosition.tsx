import { useAgent } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import { MarketActor } from "../../../utils/Interfaces/marketActor";
import { Market } from "../../../lists/marketlist";
import { Agent, HttpAgent } from "@dfinity/agent";
import { PositionParameters } from "../../../utils/declarations/market/market.did";
import { GlowingEffect } from "../../../components/Glowing-effect";
import { Icon } from "semantic-ui-react";
import { formatUnits } from "ethers/lib/utils";

interface Props {
  accountIndex: number;
  market: Market;
  order: PositionParameters;
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
  pnl: bigint;
}

export default function TradePosition({
  accountIndex,
  market,
  order,
  readWriteAgent,
  readAgent,
  pnl,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);

  const closePosition = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readWriteAgent);
      let txResponse: bigint = await marketActor.closePosition(accountIndex);
    } catch {}
  };

  const handleClosePosition = async () => {
    if (!readWriteAgent) return;
    
    try {
      setIsClosing(true);
      await closePosition();
    } catch (error) {
      // console.error("Error closing position:", error);
    } finally {
      setIsClosing(false);
    }
  };

  const formatPnL = (value: bigint) => {
    const formatted = formatUnits(value, market.quoteAsset.decimals);
    const num = parseFloat(formatted);
    return num.toFixed(2);
  };

  return (
    <div className="relative rounded-lg transition-all duration-300">
      <GlowingEffect
        spread={30}
        glow={true}
        disabled={false}
        proximity={28}
        inactiveZone={0.01}
      />
      <div className="p-4 bg-[#18191D] rounded-lg border border-[#27272b] relative z-10">
        <div className="flex justify-between items-center">
          {/* Position Details */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={market.baseAsset.logoUrl} 
                alt={market.baseAsset.symbol}
                className="w-6 h-6 rounded-full"
              />
              <div>
                <div className="font-medium text-white">
                  {market.baseAsset.symbol}/{market.quoteAsset.symbol}
                </div>
                <div className="text-sm text-gray-400">
                  {order.is_long ? "Long" : "Short"} × {order.leverage_x10/10}
                </div>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              BigInt(pnl) >= 0n ? "text-green-500" : "text-red-500"
            }`}>
              {formatPnL(pnl)} {market.quoteAsset.symbol}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClosePosition}
            disabled={isClosing || !readWriteAgent}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 
              ${isClosing ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#0300AD] hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]'}
              transition-all duration-200`}
          >
            {isClosing ? (
              <>
                <Icon name="spinner" loading />
                Closing...
              </>
            ) : (
              <>
                <Icon name="close" />
                Close
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
