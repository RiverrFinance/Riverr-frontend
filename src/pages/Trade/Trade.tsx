import { useEffect, useState } from "react";
import fetch from "isomorphic-fetch";
import { MarketSelector } from "./components/MarketSelector";
import { Market } from "../../lists/marketlist";
import DexScreenerChart from "./components/DexScreenerChart";
import { TradingPanel } from "./components/TradingPanel";
import { markets } from "../../lists/marketlist";
import { useAgent } from "@nfid/identitykit/react";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../utils/utilFunction";

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
    <div className="p-4 pt-0">
      <div className="mb-4">
        <MarketSelector
          selectedMarket={selectedMarket}
          onMarketSelect={(market) => {
            setSelectedMarket(market);
          }}
          markets={markets}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:gap-10 gap-5">
        <div className="xl:col-span-9 lg:col-span-8">
          <DexScreenerChart chart_id={selectedMarket.chartId} />
        </div>
        <div className="xl:col-span-3 lg:col-span-4 rounded-3xl bg-[#18191D]">
          <TradingPanel
            accountIndex={accountIndex}
            readAgent={readAgent}
            readWriteAgent={readWriteAgent}
            market={selectedMarket}
          />
        </div>
      </div>
    </div>
  );
};
