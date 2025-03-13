import { useState, useEffect } from 'react';
import { Icon } from 'semantic-ui-react';
import { Pairs } from './Pairs';
import { Asset, Market } from '../../types/trading';
import { AccessList } from 'ethers/lib/utils';
import { markets,quoteCurrencies } from '../lists/marketlist';




// import { toast } from 'sonner';

export interface MarketSelectorProps {
  onMarketSelect: (pair: Market) => void;
  selectedMarket:Market
}


export const MarketSelector: React.FC<MarketSelectorProps> = ({
  onMarketSelect: onPairSelect,
selectedMarket
  
}) => {
  const [selectedQuoteCurrency, setSelectedQuoteCurrency] = useState<Asset>(quoteCurrencies[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const tabs = ['All', 'Favorites', 'Top Volume'];



  // const toggleFavorite = (pairId: string) => {
  //   setFavorites(prev => {
  //     const newFavorites = new Set(prev);
  //     if (newFavorites.has(pairId)) {
  //       newFavorites.delete(pairId);
  //     } else {
  //       newFavorites.add(pairId);
  //     }
  //     return newFavorites;
  //   });

  //   // Update the selected pair's favorite status if it's the one being toggled
  //   if (selectedMarket?.id === pairId) {
  //     setSelectedMarket(prev => prev ? {
  //       ...prev,
  //       isFavorite: !prev.isFavorite
  //     } : null);
  //   }
  // };

  // const filteredPairs = markets.filter(market => {
  //   const matchesSearch =
  //     market.base_asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     market.base_asset.name.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesTab = activeTab === 'All' ||
  //     (activeTab === 'Favorites' && favorites.has(market.baseid));
  //   return matchesSearch && matchesTab;
  // }).map(pair => ({
  //   ...pair,
  //   isFavorite: favorites.has(pair.id)
  // }));




  // const formatPrice = (price: number) => {
  //   return price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2
  //   });
  // };

  return (
    <div className="relative">
         <div className="flex gap-2 mb-4">
        {quoteCurrencies.map((currency) => (
          <button
            key={currency.id}
            onClick={() => setSelectedQuoteCurrency(currency)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${selectedQuoteCurrency === currency
              ? 'bg-blue-500 text-white'
              : 'bg-[#1C1C28] text-gray-400 hover:text-white'
              }`}
          >
            {currency.symbol}
          </button>
        ))}
      </div>

      {markets.filter((market)=> {return market.quoteAsset == selectedQuoteCurrency}).map((market)=> { return <div onClick={()=>{onPairSelect(market)}}><Pairs market={market}  favorites={favorites}  isSelected={selectedMarket === market} /></div>})}
    </div>
  );
};

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    className="text-blue-500 transition-colors"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

