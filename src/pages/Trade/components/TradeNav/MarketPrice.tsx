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
    <div className="flex items-center space-x-6 text-sm text-gray-400  max-xs:text-[10px]">
      <div>
        <div>Price</div>
        <div className="text-white font-semibold">
          {formatPrice(details.price)}
        </div>
      </div>
      <div>
        <div>24h Change</div>
        <div
          className={`font-semibold ${
            details.price_change_24h >= 0 ? "text-green-500" : "text-red-500"
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

// //  // Function to format percentage (copied from your Pairs component)
const formatPercent = (percent: number | string) => {
  // Added string type for placeholder
  if (typeof percent === "string") return percent; // Handle placeholder string
  if (!percent) return "0.00";
  return percent.toFixed(2);
};

export default MarketPrice;
