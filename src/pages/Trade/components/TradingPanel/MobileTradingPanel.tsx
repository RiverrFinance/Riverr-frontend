import { useState, useEffect, memo } from "react";
import { TradingPanel } from "./TradingPanel";
import { Market } from "../../../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";

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
  // const [orderType, setOrderType] = useState<"Market" | "Limit">("Limit");

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

  // Add useEffect for click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isExpanded && !target.closest(".trading-panel-container")) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className="fixed top-[60px] max-sm:top-[70px] left-0 right-0 lg:hidden z-50">
        <div
          className={`trading-panel-container bg-[#0A1022] border-2 border-[#363c52] border-opacity-40 rounded-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col justify-start shadow-2xl ${
            isExpanded ? "h-[70vh]" : "h-20"
          }`}
        >
          <div
            className="sticky top-0 cursor-pointer bg-transparent z-10"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsExpanded(false);
              }
            }}
          >
            <div className="h-[calc(70vh-1.5rem)] overflow-y-auto overflow-x-hidden scrollbar-custom">
              <TradingPanel
                accountIndex={accountIndex}
                readAgent={readAgent}
                market={market}
                isAccordion={true}
                isExpanded={isExpanded}
                onExpandChange={setIsExpanded}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
