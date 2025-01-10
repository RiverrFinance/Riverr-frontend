import React from 'react';
import { StarIcon } from './StarIcon';
import { CurrencyPair } from '../../types/trading';

type TokenPriceDetails = {
  price: number;
  symbol: string;
  percent: number;
  name: string;
  image: string;
  id: string;
  high_24h: number; 
  low_24h: number;
  volume: number
}

interface PairProps {
  basePriceDetails: TokenPriceDetails;
  selectedQuoteCurrency: string;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelect: (pair: CurrencyPair) => void;
  isSelected: boolean;
}

export const Pairs: React.FC<PairProps> = ({
  basePriceDetails,
  selectedQuoteCurrency,
  favorites,
  onToggleFavorite,
  onSelect,
  isSelected
}) => {

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePairSelect = () => {
    const formattedPair: CurrencyPair = {
      id: basePriceDetails.id,
      symbol: basePriceDetails.symbol,
      name: basePriceDetails.name,
      current_price: basePriceDetails.price,
      price_change_percentage_24h: basePriceDetails.percent,
      image: basePriceDetails.image,
      isFavorite: favorites.has(basePriceDetails.id),
      high_24h: basePriceDetails.high_24h,
      low_24h: basePriceDetails.low_24h,
      total_volume: basePriceDetails.volume
    };
    onSelect(formattedPair);
  };

  return (
    <div
      onClick={handlePairSelect}
      className={`flex items-center justify-between p-3 hover:bg-[#1C1C28] rounded-lg cursor-pointer group ${isSelected ? 'bg-[#1C1C28]' : ''
        }`}
    >
      <div className="flex items-center space-x-3">
        <button
          className="hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(basePriceDetails.id);
          }}
        >
          <StarIcon filled={favorites.has(basePriceDetails.id)} />
        </button>
        <img src={basePriceDetails.image} alt={basePriceDetails.name} className="w-6 h-6" />
        <div>
          <div className="font-medium">
            {basePriceDetails.symbol.toUpperCase()}/{selectedQuoteCurrency}
          </div>
          <div className="text-sm text-gray-400">{basePriceDetails.name}</div>
        </div>
      </div>

      <div className="text-right">
        <div>${formatPrice(basePriceDetails.price)}</div>
        <div className={basePriceDetails.percent >= 0 ? 'text-green-500' : 'text-red-500'}>
          {basePriceDetails.percent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};
