import { memo, useEffect, useState } from "react";
import { fetchDetails } from "../../../../utils/utilFunction";
import { Market } from "../../../../lists/marketlist";
import { SECOND } from "../../../../utils/constants";

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

  return (
    <div className="flex items-center space-x-8 max-sm:space-x-4 text-sm text-gray-400 max-sm:text-xs">
      <div className="glass rounded-xl p-3 border border-white/10 bg-white/5 backdrop-blur-sm min-w-[80px]">
        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Price</div>
        <div className="text-white font-semibold text-lg max-sm:text-sm">
          {formatPrice(details.price)}
        </div>
      </div>
      <div className="glass rounded-xl p-3 border border-white/10 bg-white/5 backdrop-blur-sm min-w-[80px]">
        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">24h Change</div>
        <div
          className={`font-semibold text-lg max-sm:text-sm ${
            details.price_change_24h >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {formatPercent(details.price_change_24h)}%
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
