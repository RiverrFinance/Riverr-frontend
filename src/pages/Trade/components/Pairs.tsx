import React from "react";
import { useState, useEffect } from "react";
import { StarIcon } from "./StarIcon";
import { Market } from "../../../lists/marketlist";
import { fetchDetails } from "../../../utils/utilFunction";

interface PairProps {
  market: Market;
  favorites: Set<string>;
  isSelected?: boolean;
  onToggleFavorite?: (marketId: string) => void;
}

interface PriceDetails {
  price: number;
  price_change_24h: number;
}

const PRICE_TIMER_INTERVL = 5000;

export const Pairs: React.FC<PairProps> = ({
  market,
  favorites,
  isSelected,
  onToggleFavorite,
}) => {
  const [details, setDetails] = useState<PriceDetails>({
    price: 0.0,
    price_change_24h: 0.0,
  });

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    updateDetails();
    const intervalId = setInterval(() => {
      updateDetails();
    }, PRICE_TIMER_INTERVL);

    return () => {
      clearInterval(intervalId);
    };
  }, [market]);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [market.baseAsset.image]);

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
    return percent.toFixed(2);
  };

  return (
    <div
      className={`flex items-center justify-between p-3 hover:px-4 rounded-lg cursor-pointer group transition-all duration-200 ${
        isSelected ? "bg-[#0300ad18]" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Favorite Button */}
        <button
          type="button"
          title="Favorite"
          className="hover:scale-110 transition-transform focus:outline-none"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // if (onToggleFavorite) {
            onToggleFavorite(market.chartId);
            // }
          }}
        >
          <StarIcon filled={favorites.has(market.chartId)} />{" "}
        </button>

        {/* Asset Icon with Loading State */}
        <div className="relative w-6 h-6">
          {isFirstLoad && !imageLoaded && (
            <div className="absolute inset-0 bg-gray-700 rounded-full animate-pulse" />
          )}
          <img
            src={market.baseAsset.logoUrl || market.baseAsset.image}
            alt={market.baseAsset.symbol}
            className="w-6 h-6 rounded-full"
            onLoad={() => {
              setImageLoaded(true);
              setIsFirstLoad(false);
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              setImageLoaded(true);
              setIsFirstLoad(false);
              e.currentTarget.src =
                "https://react.semantic-ui.com/images/wireframe/square-image.png";
            }}
          />
        </div>
        {/* Asset Symbols and Name */}
        <div>
          <div className="font-medium text-white">
            {" "}
            {market.baseAsset.symbol.toUpperCase()}/
            {market.quoteAsset.symbol.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">{market.baseAsset.symbol}</div>
        </div>
      </div>

      {/* Price and 24h Change */}
      <div className="text-right">
        <div className="text-white font-medium">
          {formatPrice(details.price)}
        </div>
        <div
          className={`text-sm ${
            details.price_change_24h >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {formatPercent(details.price_change_24h)}%
        </div>
      </div>
    </div>
  );
};
