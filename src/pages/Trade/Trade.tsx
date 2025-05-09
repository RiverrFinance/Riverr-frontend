import { useEffect, useState } from "react";
import { MarketSelector } from "./components/MarketSelector";
import { Market } from "../../lists/marketlist";
import DexScreenerChart from "./components/DexScreenerChart";
import { TradingPanel } from "./components/TradingPanel";
import { markets } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../utils/constants";
import PositionsTerminal from "./components/PositionsTerminal";
import MobileTradingPanel from "./components/MobileTradingPanel";

interface Props {}

export const Trade = ({}: Props) => {
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedMarket, setSelectedMarket] = useState<Market>(markets[0]);
  const [accountIndex, setAccountIndex] = useState<number>(0);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  return (
    <div className="flex flex-col gap-5 min-h-screen p-4 max-xs:px-0 pt-0">
      <div className="z-50 shrink-0">
        <MarketSelector
          selectedMarket={selectedMarket}
          onMarketSelect={(market) => {
            setSelectedMarket(market);
          }}
          markets={markets}
        />
      </div>

      <MobileTradingPanel
        accountIndex={accountIndex}
        readAgent={readAgent}
        market={selectedMarket}
      />      

      <div className="max-lg:mt-12 flex flex-col flex-1 gap-5">
        <div className="relative h-[50rem] xxxl:min-h-[750px]">
          <div className="absolute inset-0 lg:right-[31%] bg-[#18191D] rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40">
            <div className="w-full h-full">
              <DexScreenerChart chart_id={selectedMarket.chartId} />
            </div>
          </div>

          <div className="hidden lg:block absolute right-0 w-[30%] top-0 bottom-0 bg-[#18191de9] border-2 border-dashed border-[#363c52] border-opacity-40 rounded-2xl">
            <TradingPanel
              accountIndex={accountIndex}
              readAgent={readAgent}
              market={selectedMarket}
            />
          </div>
        </div>

        <div className="flex-1 h-fit bg-[#18191de9] border-2 border-dashed border-[#363c52] border-opacity-40 rounded-2xl overflow-hidden">
          <PositionsTerminal market={selectedMarket} readAgent={readAgent} />
        </div>
      </div>
    </div>
  );
};
