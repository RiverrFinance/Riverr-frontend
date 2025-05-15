import { useState, useEffect, memo } from "react";
import { TradingPanel } from "./TradingPanel";
import { Market } from "../../../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { Icon } from "semantic-ui-react";

interface Props {
  accountIndex: number;
  readAgent: HttpAgent;
  market: Market;
}

export default memo(function MobileTradingPanel({
  accountIndex,
  readAgent,
  market,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prevent body scroll when panel is expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className="fixed top-[60px] left-0 right-0 lg:hidden z-40">
        <div
          className={`bg-[#18191d] border-2 border-dashed border-[#363c52] border-opacity-40 rounded-lg transition-all duration-300 ease-in-out overflow-hidden flex flex-col justify-start ${
            isExpanded ? "h-[70vh]" : "h-14"
          }`}
        >
          <div
            className="sticky top-0 h-14 flex items-center justify-between px-4 cursor-pointer bg-[#18191de9] z-10"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <img
                src={market.baseAsset.logoUrl}
                alt={market.baseAsset.symbol}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-white">
                {market.baseAsset.symbol.toUpperCase()} /{" "}
                {market.quoteAsset.symbol.toUpperCase()}
              </span>
            </div>
            <Icon
              name={isExpanded ? "angle up" : "angle down"}
              className="text-white text-2xl"
            />
          </div>

          {isExpanded && (
            <div className="h-[calc(70vh-3.5rem)] overflow-y-auto scrollbar-custom">
              <TradingPanel
                accountIndex={accountIndex}
                readAgent={readAgent}
                market={market}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
});
