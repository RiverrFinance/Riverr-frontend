import { useState } from 'react';
import { CurrencyPairSelector } from '../components/CurrencyPairSelector';
import { CurrencyPair } from '../../types/trading';
import DexScreenerChart from '../components/DexScreenerChart';
import { TradingPanel } from '../components/TradingPanel';

export const Trade = () => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [selectedQuoteCurrency, setSelectedQuoteCurrency] = useState<string>('USD');

  const quoteCurrencies = ['USD', 'ICP', 'USDT', 'ETH'];

  return (
    <div className="p-4">
      {/* Currency Tabs */}
      <div className="flex gap-2 mb-4">
        {quoteCurrencies.map((currency) => (
          <button
            key={currency}
            onClick={() => setSelectedQuoteCurrency(currency)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${selectedQuoteCurrency === currency
              ? 'bg-blue-500 text-white'
              : 'bg-[#1C1C28] text-gray-400 hover:text-white'
              }`}
          >
            {currency}
          </button>
        ))}
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DexScreenerChart
            selectedQuoteCurrency={selectedQuoteCurrency}
            selectedPair={selectedPair}
          />
        </div>
        <div>
          <CurrencyPairSelector
            onPairSelect={(pair) => {
              setSelectedPair(pair);
              console.log('Selected pair:', pair); // Debug log
            }}
            selectedQuoteCurrency={selectedQuoteCurrency}
            setSelectedQuoteCurrency={setSelectedQuoteCurrency}
          />
          <TradingPanel
            maxLeverage={100}
            defaultLeverage={10}
            availableBalance={0}
            supportedTokens={[selectedQuoteCurrency]}
            defaultToken={selectedQuoteCurrency}
          />
        </div>
      </div>
    </div>
  );
}; 