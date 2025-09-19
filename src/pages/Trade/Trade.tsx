import { useEffect, useState } from "react";
import { MarketSelector } from "./components/TradeNav/MarketSelector";
import { Market } from "../../lists/marketlist";
import DexScreenerChart from "./components/DexScreenerChart/DexScreenerChart";
import { TradingPanel } from "./components/TradingPanel/TradingPanel";
import { markets } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../utils/constants";
import PositionsPanel from "./components/PositionsPanel/PositionsPanel";
import MobileTradingPanel from "./components/TradingPanel/MobileTradingPanel";
import { UpgradeNotification } from "../../components/V2Notification";

export const Trade = () => {
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedMarket, setSelectedMarket] = useState<Market>(markets[0]);
  const [accountIndex, setAccountIndex] = useState<number>(0);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  return (
    <div className="min-h-full text-white">
      {/* Notification */}
      {/* {showNotification && (
        <div className="relative z-50">
          <UpgradeNotification onDismiss={() => setShowNotification(false)} />
        </div>
      )} */}

      {/* Mobile Trading Panel */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0e14]/95 backdrop-blur-md border-b border-gray-800">
        <MobileTradingPanel
          accountIndex={accountIndex}
          readAgent={readAgent}
          market={selectedMarket}
        />
      </div>

      {/* Main Container */}
      <div className="flex flex-col min-h-screen">
        {/* Market Selector  */}
        <div className="px-3 lg:px-6 mb-4 lg:mb-6 mt-16 lg:mt-0 z-50">
          <MarketSelector
            selectedMarket={selectedMarket}
            onMarketSelect={(market) => {
              setSelectedMarket(market);
            }}
            markets={markets}
          />
        </div>

        {/* Main Trading Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 px-3 lg:px-6 pb-4 lg:pb-6 min-h-0">
          
          {/* Chart and Positions */}
          <div className="flex-1 flex flex-col gap-4 lg:gap-6 min-w-0 min-h-0">
            
            {/* Chart Section */}
            <div className="flex-1 min-h-[300px] lg:min-h-[420px] xl:min-h-[520px]">
              <div className="h-full glass rounded-xl lg:rounded-2xl border border-gray-700/50 overflow-hidden">
                <DexScreenerChart chart_id={selectedMarket.chartId} />
              </div>
            </div>

            {/* Positions Panel */}
            <div className="h-[220px] sm:h-[260px] lg:h-[320px] xl:h-[360px] flex-shrink-0">
              <div className="h-full glass rounded-xl lg:rounded-2xl border border-gray-700/50 overflow-hidden">
                <PositionsPanel market={selectedMarket} readAgent={readAgent} />
              </div>
            </div>
          </div>

          {/* Trading Panel (Desktop) */}
          <div className="hidden lg:flex lg:w-[340px] xl:w-[420px] 2xl:w-[460px] flex-shrink-0">
            <div className="w-full">
              <TradingPanel
                accountIndex={accountIndex}
                readAgent={readAgent}
                market={selectedMarket}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};