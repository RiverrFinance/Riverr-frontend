import { useState } from 'react';
import { MarketSelector } from '../components/MarketSelector';
import { Market } from '../../types/trading';
import DexScreenerChart from '../components/DexScreenerChart';
import {TradingPanel} from '../components/TradingPanel';
import { markets } from '../lists/marketlist';
import { Identity } from '@dfinity/agent';


interface Props {
  Identity:Identity | null,
  setIdentity:(id:Identity) =>void
}


export const Trade = ({Identity}:Props) => {
  const [selectedMarket, setSelectedMarket] = useState<Market >(markets[0]);

  return (
    <div className="p-4">
      {/* Currency Tabs */} 
   
      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-9">
          <DexScreenerChart
            chart_id={selectedMarket?.chartId}
          />
        </div>
        <div className="lg:col-span-3">
          <MarketSelector
            selectedMarket={selectedMarket}
            onMarketSelect={(market) => {
              setSelectedMarket(market);
          
            }}
         
          />
          <TradingPanel market={selectedMarket} identity={Identity}/>
        </div>
      </div>
    </div>
  );
}; 

