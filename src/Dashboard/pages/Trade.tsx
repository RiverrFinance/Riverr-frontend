import { useState } from 'react';
import { CurrencyPairSelector } from '../components/CurrencyPairSelector';
import { CurrencyPair } from '../../types/trading';
import { Icon } from 'semantic-ui-react';
import { TradingPanel } from '../components/TradingPanel';
import { OrderData } from '../../types/trading';
import DexScreenerChart from '../components/DexScreenerChart';

export const Trade = () => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    }
    if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  };

  const handleOrderSubmit = (orderData: OrderData) => {
    console.log('Order submitted:', orderData);
    // Handle the order submission
  };

  return (
    <div className="p-0 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0 mb-4 max-sm:p-4 max-sm:px-6">
        {/* Left side */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <CurrencyPairSelector onPairSelect={setSelectedPair} />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Price:</span>
            {selectedPair ? (
              <>
                {selectedPair.price_change_percentage_24h >= 0 ? (
                  <Icon name="caret up" className="text-green-500 text-sm" />
                ) : (
                  <Icon name="caret down" className="text-red-500 text-sm" />
                )}
                <span className="text-md font-semibold text-white">
                  ${formatPrice(selectedPair.current_price)}
                </span>
              </>
            ) : (
              <span className="text-md font-semibold text-white">$0.00</span>
            )}
          </div>
        </div>

        {/* Right side with Stats and Icons */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8">
          {/* Trading Stats */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-4 lg:flex lg:items-center lg:gap-8">
            {/* 24h Change */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1">
                <Icon name="chart line" className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-400">24h Change</span>
              </div>
              {selectedPair ? (
                <span className={selectedPair.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {selectedPair.price_change_percentage_24h >= 0 ? '+' : ''}
                  {selectedPair.price_change_percentage_24h.toFixed(2)}%
                </span>
              ) : '-'}
            </div>

            {/* 24h High */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1">
                <Icon name="arrow up" className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-400">24h High</span>
              </div>
              <span className="text-white">
                {selectedPair ? `$${formatPrice(selectedPair.high_24h)}` : '-'}
              </span>
            </div>

            {/* 24h Low */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1">
                <Icon name="arrow down" className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-400">24h Low</span>
              </div>
              <span className="text-white">
                {selectedPair ? `$${formatPrice(selectedPair.low_24h)}` : '-'}
              </span>
            </div>

            {/* 24h Volume */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1">
                <Icon name="chart bar" className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-400">24h Volume (USDT)</span>
              </div>
              <span className="text-white">
                {selectedPair ? `${formatVolume(selectedPair.total_volume)}` : '-'}
              </span>
            </div>
          </div>

          {/* Vertical Divider - Hidden on mobile */}
          <div className="hidden lg:block h-8 w-px bg-gray-800" />

          {/* Action Icons */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
            {/* Trading Guide */}
            <div className="flex items-center whitespace-nowrap">
              <button
                className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                title="Trading Guide"
              >
                <Icon name="book" className="text-gray-400 text-sm" />
              </button>
              <span className="text-gray-400 text-sm hidden lg:inline">Trading Guide</span>
            </div>

            {/* News */}
            <div className="flex items-center whitespace-nowrap">
              <button
                className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                title="News"
              >
                <Icon name="file text" className="text-gray-400 text-sm" />
              </button>
              <span className="text-gray-400 text-sm hidden lg:inline">News</span>
            </div>

            {/* Mobile-only icons */}
            <div className="flex lg:hidden items-center gap-3">
              <div className="relative">
                <button
                  className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                  title="Notifications"
                >
                  <Icon name="bell" className="text-gray-400 text-sm" />
                </button>
              </div>

              <div className="relative">
                <button
                  className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                  title="Account"
                >
                  <Icon name="user" className="text-gray-400 text-sm" />
                </button>
              </div>

              <div className="relative">
                <button
                  className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                  title="Settings"
                >
                  <Icon name="setting" className="text-gray-400 text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-6 mt-6">
        <div className="lg:col-span-2">
          <DexScreenerChart />
        </div>
        <div className='max-lg:row-start-1'>
          <TradingPanel
            maxLeverage={100}
            defaultLeverage={10}
            onOrderSubmit={handleOrderSubmit}
            availableBalance={0}
            supportedTokens={['USDT', 'USDC']}
            defaultToken="USDT"
          />
        </div>
      </div>
    </div>
  );
}; 