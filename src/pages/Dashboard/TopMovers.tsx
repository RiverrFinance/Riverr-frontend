import { memo } from "react";
import { GradientBackgroundBackward } from "../../components/GradientBackground";
import { CryptoAreaChart } from "../../components/AreaChart";

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  isFavorite?: boolean;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  pairAddress: string;
  chainId: string;
  dexId: string;
}

interface TopMoversProps {
  topMovers: CoinGeckoMarketData[];
  isLoadingTopMovers: boolean;
}

const format = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const TopMovers = memo(({ topMovers, isLoadingTopMovers }: TopMoversProps) => {
  return (
    <div className="py-8 px-5 max-xs:px-3 glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
      <GradientBackgroundBackward />
      <div className="text-2xl font-bold mb-6 capitalize text-white">
        Top Movers
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-96 overflow-y-scroll">
        {isLoadingTopMovers
          ? Array(32)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-20 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                      <div className="h-3 w-12 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                    </div>
                  </div>
                  <div className="space-y-2 flex items-center gap-4">
                    <div className="h-6 w-24 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                    <div className="h-4 w-16 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                  </div>
                </div>
              ))
          : topMovers.slice(0, 32).map((coin) => (
              <div
                key={coin.id}
                className="glass cursor-cell group relative rounded-xl p-4 border border-white/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-md font-semibold text-white">
                      {coin.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex items-center gap-4">
                    <div
                      className={`text-sm font-bold ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ${format(coin.current_price)}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                  <CryptoAreaChart
                    isPositive={coin.price_change_percentage_24h >= 0}
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#14024262] to-[#02074c1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
      </div>
    </div>
  );
});

export default TopMovers;
