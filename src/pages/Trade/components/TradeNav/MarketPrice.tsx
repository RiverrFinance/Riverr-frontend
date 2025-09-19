import { memo, useEffect, useState } from "react";
import { fetchDetails } from "../../../../utils/utilFunction";
import { Market } from "../../../../lists/marketlist";
import { SECOND } from "../../../../utils/constants";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  getStaticOpenInterest,
  getStaticAvailableLiquidity,
  getStaticNetRate,
  formatMillions,
} from "../../../../utils/metrics";

interface PriceDetails {
  price: number;
  price_change_24h: number;
  high_24h?: number;
  low_24h?: number;
  volume?: number;
}

const MarketPrice = memo(({ market }: { market: Market }) => {
  const [details, setDetails] = useState<PriceDetails>({
    price: 0,
    price_change_24h: 0,
  });

  useEffect(() => {
    updateDetails();
    const interval: NodeJS.Timeout = setInterval(() => {
      updateDetails();
    }, 10 * SECOND);
    return () => clearInterval(interval);
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
      // console.log(err);
    }
  };

  const openInterest = getStaticOpenInterest();
  const availableLiquidity = getStaticAvailableLiquidity();
  const netRate = getStaticNetRate();

  return (
    <div className="flex items-center gap-6 text-sm text-gray-300">
      {/* PRICE */}
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          PRICE
        </span>
        <span className="text-white font-medium">
          ${formatPrice(details.price)}
        </span>
      </div>

      {/* 24H CHANGE */}
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          24H CHANGE
        </span>
        <span
          className={`font-medium ${
            details.price_change_24h >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {details.price_change_24h >= 0 ? "+" : ""}
          {formatPercent(details.price_change_24h)}%
        </span>
      </div>

      {/* OPEN INTEREST */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-xs uppercase tracking-wide">
            OPEN INTEREST
          </span>
          <div className="flex items-center gap-1">
            <span className="text-green-400 text-xs">
              ({openInterest.long}%
            </span>
            <span className="text-gray-400 text-xs">/</span>
            <span className="text-red-400 text-xs">{openInterest.short}%)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-medium">{formatMillions(openInterest.longAmountMillions)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-red-400 font-medium">{formatMillions(openInterest.shortAmountMillions)}</span>
          </div>
        </div>
      </div>

      {/* AVAILABLE LIQUIDITY */}
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          AVAILABLE LIQUIDITY
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-medium">{formatMillions(availableLiquidity.longLiquidityMillions)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-red-400 font-medium">{formatMillions(availableLiquidity.shortLiquidityMillions)}</span>
          </div>
        </div>
      </div>

      {/* NET RATE */}
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          NET RATE / 1H
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {parseFloat(netRate.hourlyPercent) >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span
              className={`font-medium text-sm ${
                parseFloat(netRate.hourlyPercent) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {parseFloat(netRate.hourlyPercent) >= 0 ? "+" : ""}
              {netRate.hourlyPercent}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            {parseFloat(netRate.dailyPercent) >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span
              className={`text-xs ${
                parseFloat(netRate.dailyPercent) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {parseFloat(netRate.dailyPercent) >= 0 ? "+" : ""}
              {netRate.dailyPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

const formatPrice = (price: number | string) => {
  if (typeof price === "string") return price;
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const formatPercent = (percent: number | string) => {
  if (typeof percent === "string") return percent;
  if (!percent) return "0.00";
  return percent.toFixed(2);
};

export default MarketPrice;
