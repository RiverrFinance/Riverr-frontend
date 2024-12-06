import React from 'react';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({ symbol, interval }) => {
  return (
    <div className="bg-[#1C1C28] p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-white font-semibold">{symbol}</span>
          <span className="text-gray-400">24h Change</span>
          <span className="text-red-500">-0.01%</span>
        </div>
        <div className="flex items-center space-x-4">
          <button aria-label="1 minute interval" className="px-3 py-1 rounded bg-[#2A2A3A] text-white hover:bg-[#3A3A4A]">1m</button>
          <button aria-label="5 minute interval" className="px-3 py-1 rounded bg-[#2A2A3A] text-white hover:bg-[#3A3A4A]">5m</button>
          <button aria-label="15 minute interval" className="px-3 py-1 rounded bg-[#2A2A3A] text-white hover:bg-[#3A3A4A]">15m</button>
          <button aria-label="1 hour interval" className="px-3 py-1 rounded bg-[#2A2A3A] text-white hover:bg-[#3A3A4A]">1h</button>
        </div>
      </div>
      <div className="h-[400px] bg-[#1C1C28] rounded-lg">
        {/* Chart will be implemented here */}
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Trading Chart Placeholder
        </div>
      </div>
    </div>
  );
}; 