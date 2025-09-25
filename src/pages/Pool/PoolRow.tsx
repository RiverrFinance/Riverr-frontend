import { Star, TrendingDown, TrendingUp } from "lucide-react";
import { Market } from "../../lists/marketlist";
import { getOpenInterest, getReservedFactor } from "../../utils/metrics";
import { CryptoAreaChart } from "../../components/AreaChart";

export const PoolRow = ({ 
  market, 
  isFavorite, 
  onToggleFavorite,
  onRowClick 
}: { 
  market: Market; 
  isFavorite: boolean; 
  onToggleFavorite: (marketId: string) => void;
  onRowClick: (market: Market) => void;
}) => {
  
  // random metrics
  const tvl = (Math.random() * 200 + 50).toFixed(2);
  const performance = (Math.random() * 40 - 10).toFixed(2);
  const isPositive = parseFloat(performance) > 0;
  const oi = getOpenInterest();
  const reserved = getReservedFactor();

  return (
    <div 
      onClick={() => onRowClick(market)}
      className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 transition-all duration-200 border-b border-gray-800 last:border-b-0 group cursor-pointer hover:bg-gradient-to-r hover:from-[#14024262] hover:to-[#02074c1a]"
    >
      {/* Pool Info */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-3 flex items-center gap-2 sm:gap-3">
        <button
          title='button'
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (market.market_id) onToggleFavorite(market.market_id);
          }}
          className={`transition-all duration-200 p-1 rounded hover:bg-white/10 ${
            isFavorite ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <Star size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        
        <div className="relative flex-shrink-0">
          <img 
            src={market.baseAsset.logoUrl} 
            alt={market.baseAsset.symbol} 
            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
          />
          <img 
            src={market.quoteAsset.logoUrl} 
            alt={market.quoteAsset.symbol} 
            className="w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 border-2 border-[#16182e]"
          />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="text-white font-semibold text-xs sm:text-sm lg:text-base truncate">
            GM: {market.baseAsset.symbol.toUpperCase()}/{market.quoteAsset.symbol.toUpperCase()}
          </div>
          <div className="text-gray-500 text-xs hidden sm:block truncate">
            [{market.baseAsset.symbol.toUpperCase()}-{market.quoteAsset.symbol.toUpperCase()}]
          </div>
        </div>
      </div>

      {/* TVL  */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 text-right lg:text-left ml-3">
        <div className="text-white font-semibold text-xs sm:text-sm lg:text-base">${tvl}m</div>
        <div className="text-gray-500 text-xs hidden lg:block">({(parseFloat(tvl) * 0.8).toFixed(1)} GM)</div>
      </div>

      {/* Reserved Factor */}
      <div className="hidden lg:block col-span-2 ml-3">
        <div className="text-white font-semibold text-sm lg:text-base">{reserved}</div>
      </div>

      {/* Total Open Interest */}
      <div className="hidden sm:flex col-span-2 lg:col-span-2 items-center justify-center lg:justify-start gap-1 sm:gap-2 ml-3">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-green-400 font-medium text-xs sm:text-sm">{oi.long}%</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-red-400" />
          <span className="text-red-400 font-medium text-xs sm:text-sm">{oi.short}%</span>
        </div>
      </div>

      {/* Snapshot */}
      <div className="col-span-1 sm:col-span-1 lg:col-span-3 flex items-center justify-end lg:justify-center">
        <div className="w-16 h-10 sm:w-20 sm:h-12 lg:w-24 lg:h-14">
          <CryptoAreaChart isPositive={isPositive} />
        </div>
      </div>
    </div>
  );
};