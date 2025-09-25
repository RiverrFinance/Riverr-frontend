import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { Market } from "../../../../lists/marketlist";
import { fetchDetails } from "../../../../utils/utilFunction";
import {
  getStaticOpenInterest,
  getStaticAvailableLiquidity,
  formatLargeUSD,
} from "../../../../utils/metrics";

const PRICE_TIMER_INTERVAL = 5000;

interface PriceDetails {
  price: number;
  price_change_24h: number;
}

export const Pairs: React.FC<{
  market: Market;
  favorites: boolean;
  onToggleFavorite: (marketId: string) => void;
}> = ({ market, favorites, onToggleFavorite }) => {

  const [details, setDetails] = useState<PriceDetails>({
    price: 0.0,
    price_change_24h: 0.0,
  });

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    updateDetails();
    const intervalId = setInterval(() => {
      updateDetails();
    }, PRICE_TIMER_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [market]);

  const updateDetails = async () => {
    try {
      const [response1, response2] = await Promise.all([
        fetchDetails(market.baseAsset.priceID),
        fetchDetails(market.quoteAsset.priceID),
      ]);

      const [baseAssetDetails, quoteAssetDetails]: Array<PriceDetails> =
        await Promise.all([response1.json(), response2.json()]);

      let price = baseAssetDetails.price / quoteAssetDetails.price;

      let price_change_24h =
        ((baseAssetDetails.price_change_24h -
          quoteAssetDetails.price_change_24h) *
          100) /
        (quoteAssetDetails.price_change_24h + 100);

      setDetails({ price, price_change_24h });
    } catch (err) {
      console.log(err);
    }
  };

  // Static-like large USD helpers derived from shared utilities
  const getOpenInterestUSD = () => {
    const oi = getStaticOpenInterest();
    const totalMillions =
      parseFloat(oi.longAmountMillions) + parseFloat(oi.shortAmountMillions);
    return formatLargeUSD(totalMillions * 1_000_000);
  };

  const getAvailableLiquidityUSD = () => {
    const liq = getStaticAvailableLiquidity();
    const totalMillions =
      parseFloat(liq.longLiquidityMillions) +
      parseFloat(liq.shortLiquidityMillions);
    return formatLargeUSD(totalMillions * 1_000_000);
  };

  const formatPrice = (price: number) => {
    if (!price) return "0.00";
    return price < 1
      ? price.toFixed(6)
      : price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const formatPercent = (percent: number) => {
    if (!percent) return "0.00";
    return Math.abs(percent).toFixed(2);
  };

  return (
    <div className={`grid grid-cols-6 gap-4 items-center p-4 hover:bg-white/5 cursor-pointer group transition-all duration-200 `}>
      {/* Market */}
      <div className="col-span-2 flex items-center space-x-3">
        <button
          type="button"
          title="Favorite"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (market.market_id) onToggleFavorite(market.market_id);
          }}
          className={`transition-all duration-200 p-1 rounded hover:bg-white/10 ${
            favorites ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"
          }`}
        >
          <Star size={14} className="" fill={favorites ? 'currentColor' : 'none'} />
        </button>
        <div className="relative w-7 h-7">
          <img
            src={market.baseAsset.logoUrl || market.baseAsset.image}
            alt={market.baseAsset.symbol}
            className="w-7 h-7 rounded-full"
            onLoad={() => setImageError(false)}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              setImageError(true);
              e.currentTarget.src =
                "https://react.semantic-ui.com/images/wireframe/square-image.png";
            }}
          />
        </div>

        <div>
          <div className="font-medium text-white text-sm">
            {market.baseAsset.symbol.toUpperCase()}/
            {market.quoteAsset.symbol.toUpperCase()}
          </div>
          <div className="text-xs text-gray-400 truncate max-w-[120px]">
            {market.baseAsset.name}
          </div>
        </div>
      </div>

      {/* Last Price */}
      <div className="text-right">
        <div className="text-white font-medium text-sm">
          {formatPrice(details.price)}
        </div>
      </div>

      {/* 24H% with proper color coding and icon */}
      <div className="text-right">
        <div
          className={`flex items-center justify-end gap-1 text-sm font-medium ${
            details.price_change_24h >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {details.price_change_24h >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {details.price_change_24h >= 0 ? "+" : "-"}
            {formatPercent(details.price_change_24h)}%
          </span>
        </div>
      </div>

      {/* Open Interest */}
      <div className="text-right">
        <div className="text-white font-medium text-sm">
          {getOpenInterestUSD()}
        </div>
      </div>

      {/* Available Liquidity */}
      <div className="text-right">
        <div className="text-white font-medium text-sm">
          {getAvailableLiquidityUSD()}
        </div>
      </div>
    </div>
  );
};
