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
    <div className="flex flex-col min-h-screen p-6 max-sm:px-0">
      {showNotification && (
        <UpgradeNotification 
          onDismiss={() => setShowNotification(false)}
        />
      )}
      
      <div className="z-40 flex flex-col gap-6">
        <MobileTradingPanel
          accountIndex={accountIndex}
          readAgent={readAgent}
          market={selectedMarket}
        />
        
        <div className="shrink-0 max-lg:mt-36 z-40">
          <MarketSelector
            selectedMarket={selectedMarket}
            onMarketSelect={(market) => {
              setSelectedMarket(market);
            }}
            markets={markets}
          />
        </div>

        <div className=" flex flex-col flex-1 gap-6">
          <div className="relative h-[28rem] sm:h-[36rem] lg:h-[50rem] xxxl:min-h-[750px]">
            <div className="absolute inset-0 lg:right-[31%] glass rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
              <div className="w-full h-full">
                <DexScreenerChart chart_id={selectedMarket.chartId} />
              </div>
            </div>

            <div className="hidden lg:block absolute right-0 w-[30%] top-0 bottom-0 glass rounded-2xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
              <TradingPanel
                accountIndex={accountIndex}
                readAgent={readAgent}
                market={selectedMarket}
              />
            </div>
          </div>

          <div className="flex-1 h-fit glass rounded-2xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
            <PositionsPanel market={selectedMarket} readAgent={readAgent} />
          </div>
        </div>
      </div>
    </div>
  );
};
