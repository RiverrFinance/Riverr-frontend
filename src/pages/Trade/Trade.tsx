import { useEffect, useState } from "react";
// import fetch from "isomorphic-fetch";
import { MarketSelector } from "./components/MarketSelector";
import { Market } from "../../lists/marketlist";
import DexScreenerChart from "./components/DexScreenerChart";
import { TradingPanel } from "./components/TradingPanel";
import { markets } from "../../lists/marketlist";
import { useAgent } from "@nfid/identitykit/react";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { GlowingEffect } from "../../components/Glowing-effect";
import PositionsTerminal from "./components/PositionsTerminal";

interface Props {}

export const Trade = ({}: Props) => {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedMarket, setSelectedMarket] = useState<Market>(markets[0]);
  const [accountIndex, setAccountIndex] = useState<number>(0);

  useEffect(() => {
    HttpAgent.create({ fetch, host: ICP_API_HOST, retryTimes: 5 }).then(
      setReadAgent
    );
  }, []);

  return (
    <div className="p-4 pt-0 flex flex-col gap-5">
      <div>
        <MarketSelector
          selectedMarket={selectedMarket}
          onMarketSelect={(market) => {
            setSelectedMarket(market);
          }}
          markets={markets}
        />
      </div>

      {/* Chart and Trading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="xl:col-span-9 lg:col-span-8 space-y-5">
          
          {/* Chart */}
          <div className="w-full h-[600px] lg:h-[70vh]">
            <DexScreenerChart chart_id={selectedMarket.chartId} />
          </div>

          {/* Positions Terminal */}
          <div className="bg-[#18191de9] border-2 border-dashed border-[#363c52] border-opacity-40 rounded-2xl relative">
            <GlowingEffect
              spread={10}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
            <div className="relative z-10">
              <PositionsTerminal
                market={selectedMarket}
                readAgent={readAgent}
                readWriteAgent={readWriteAgent}
              />
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="xl:col-span-3 lg:col-span-4 rounded-2xl bg-[#18191de9] border-2 border-dashed border-[#363c52] border-opacity-40 relative">
          <GlowingEffect
            spread={10}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <div className="relative z-10">
            <TradingPanel
              accountIndex={accountIndex}
              readAgent={readAgent}
              readWriteAgent={readWriteAgent}
              market={selectedMarket}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
