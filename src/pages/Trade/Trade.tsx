import { useEffect, useState } from "react";
import { MarketSelector } from "./components/MarketSelector";
import { Market } from "../../lists/marketlist";
import DexScreenerChart from "./components/DexScreenerChart";
import { TradingPanel } from "./components/TradingPanel";
import { markets } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../utils/constants";
import PositionsTerminal from "./components/PositionsTerminal";

interface Props {}

export const Trade = ({}: Props) => {
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedMarket, setSelectedMarket] = useState<Market>(markets[0]);
  const [accountIndex, setAccountIndex] = useState<number>(0);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  return (
    <div className="p-4 max-xs:px-0 pt-0 grid grid-rows-12 gap-5 h-full min-h-screen">
      <div className=" row-span-1 z-20">
        <MarketSelector
          selectedMarket={selectedMarket}
          onMarketSelect={(market) => {
            setSelectedMarket(market);
          }}
          markets={markets}
        />
      </div>

      <div className="row-span-11 gap-5 flex flex-col h-full max-lg:-mt-20 xxxl:-mt-20 -mt-5">
        <div className="grid max-lg:grid-rows-2 max-lg:min-h-[100rem] max-h-[50rem] h-full xxxl:min-h-[750px] grid-cols-12 gap-5 max-lg:gap-y-18 ">
          <div className="col-span-12 lg:col-span-8 xxxl:col-span-10 max-lg:row-span-1 max-lg:min-h-[50rem] max-lg:h-[50rem] min-h-[47.5rem] bg-[#18191D] rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 relative">
            <div className="absolute inset-0">
              <DexScreenerChart chart_id={selectedMarket.chartId} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 xxxl:col-span-2 max-lg:row-span-1 bg-[#18191de9] border-2 border-dashed border-[#363c52] border-opacity-40 rounded-2xl relative h-fit xxxl:h-full">
            <div className="relative z-10 h-fit overflow-auto">
              <TradingPanel
                accountIndex={accountIndex}
                readAgent={readAgent}
                market={selectedMarket}
              />
            </div>
          </div>
        </div>

        <div className="max-lg:-mt-[2rem] bg-[#18191de9] border-2 border-dashed border-[#363c52] border-opacity-40 rounded-2xl relative h-full">
          <div className="relative z-10 h-full overflow-auto">
            <PositionsTerminal market={selectedMarket} readAgent={readAgent} />
          </div>
        </div>
      </div>
    </div>
  );
};
