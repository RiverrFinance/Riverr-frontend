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

const PRICE_TIMER_INTERVL = 10000;

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
  useEffect(() => {
    updateDetails();
    const intervalId = setInterval(() => {
      updateDetails();
    }, PRICE_TIMER_INTERVL);

    return () => {
      clearInterval(intervalId);
    };
  }, [market]);

  const isFavorite = favorites.has(market.chartId);

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
    // <div
    //   className={`flex items-center justify-between p-3 hover:bg-[#1C1C28] rounded-lg cursor-pointer group ${
    //     isSelected ? "bg-[#1C1C28]" : ""
    //   }`}
    // >
    //   <div className="flex items-center space-x-3">
    //     <button
    //       className="hover:scale-110 transition-transform"
    //       onClick={(e) => {
    //         e.stopPropagation();
    //       }}
    //     >
    //       <StarIcon filled={favorites?.has(market.baseAsset.priceID)} />
    //     </button>
    //     <img
    //       src={market.baseAsset.image}
    //       alt={market.baseAsset.symbol}
    //       className="w-6 h-6"
    //       // onError={(e) => {
    //       //   e.currentTarget.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
    //       // }}
    //     />
    //     <div>
    //       <div className="font-medium">
    //         {market.baseAsset.symbol.toUpperCase()}/
    //         {market.quoteAsset.symbol.toUpperCase()}
    //       </div>
    //       <div className="text-sm text-gray-400">{market.baseAsset.symbol}</div>
    //     </div>
    //   </div>

    //   <div className="text-right">
    //     <div className="text-white font-medium">
    //       {formatPrice(details.price)}
    //     </div>
    //     <div
    //       className={`text-sm ${
    //         details.price_change_24h <= 0 ? "text-green-500" : "text-red-500"
    //       }`}
    //     >
    //       {formatPercent(details.price_change_24h)}%
    //     </div>
    //   </div>
    // </div>

    <div
      className={`flex items-center justify-between p-3 hover:bg-[#1C1C28] rounded-lg cursor-pointer group ${
        isSelected ? "bg-[#1C1C28]" : "" // Apply selected background
      }`}
      // onClick handler is in the parent MarketSelector now
    >
      <div className="flex items-center space-x-3">
        {/* Favorite Button */}
        <button
          className="hover:scale-110 transition-transform focus:outline-none" // Added focus outline none
          onClick={(e) => {
            e.stopPropagation(); // Prevent the click from closing the dropdown
            onToggleFavorite(market.chartId); // Changed: Call onToggleFavorite with market ID
          }}
        >
          {/* Using your custom StarIcon component */}
          <StarIcon filled={isFavorite} />{" "}
          {/* Changed: Use StarIcon and pass filled prop */}
        </button>
        {/* Asset Icon */}
        <img
          src={market.baseAsset.image}
          alt={market.baseAsset.symbol}
          className="w-6 h-6 rounded-full" // Added rounded-full for circular image
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            // Added type for event
            e.currentTarget.src =
              "https://react.semantic-ui.com/images/wireframe/square-image.png"; // Placeholder on error
          }}
        />
        {/* Asset Symbols and Name */}
        <div>
          <div className="font-medium text-white">
            {" "}
            {/* Added text-white */}
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
            details.price_change_24h >= 0 ? "text-green-500" : "text-red-500" // Green for positive, Red for negative
          }`}
        >
          {formatPercent(details.price_change_24h)}%
        </div>
      </div>
    </div>
  );
};
