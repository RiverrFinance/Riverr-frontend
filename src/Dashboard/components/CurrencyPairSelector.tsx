import { useState, useEffect } from 'react';
import { Icon } from 'semantic-ui-react';

export interface CurrencyPair {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  isFavorite?: boolean;
}

interface CurrencyPairSelectorProps {
  onPairSelect?: (pair: CurrencyPair | null) => void;
}

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

export const CurrencyPairSelector: React.FC<CurrencyPairSelectorProps> = ({ onPairSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [pairs, setPairs] = useState<CurrencyPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedStableCoin, setSelectedStableCoin] = useState('USD');

  const tabs = ['All', 'Favorites', 'Top Volume', 'New Listing', 'Memecoins'];
  const stableCoins = ['USD', 'USDT', 'USDC', 'ETH', 'BTC'];

  const fetchCryptoPairs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedStableCoin.toLowerCase()}&order=market_cap_desc&per_page=50&page=1&sparkline=false`
      );
      const data = await response.json();
      setPairs(data);
    } catch (error) {
      console.error('Error fetching crypto pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoPairs();
  }, [selectedStableCoin]);

  const toggleFavorite = (pairId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(pairId)) {
        newFavorites.delete(pairId);
      } else {
        newFavorites.add(pairId);
      }
      return newFavorites;
    });

    // Update the selected pair's favorite status if it's the one being toggled
    if (selectedPair?.id === pairId) {
      setSelectedPair(prev => prev ? {
        ...prev,
        isFavorite: !prev.isFavorite
      } : null);
    }
  };

  const filteredPairs = pairs.filter(pair => {
    const matchesSearch =
      pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Favorites' && favorites.has(pair.id));
    return matchesSearch && matchesTab;
  }).map(pair => ({
    ...pair,
    isFavorite: favorites.has(pair.id)
  }));

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePairSelect = (pair: CurrencyPair) => {
    const selectedPairWithFavorite = {
      ...pair,
      isFavorite: favorites.has(pair.id)
    };
    setSelectedPair(selectedPairWithFavorite);
    onPairSelect?.(selectedPairWithFavorite);
    setIsOpen(false);
  };

  const handleStableCoinSelect = (coin: string) => {
    setSelectedStableCoin(coin);
    // Clear selected pair when changing base currency
    setSelectedPair(null);
  };

  return (
    <div className="relative">
      {/* Selected Pair Display */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-medium min-w-[180px] sm:min-w-[240px] overflow-hidden transition-all duration-300"
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-blue-900/50 backdrop-blur-md rounded-lg transition-opacity duration-300" />

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-blue-900/30 to-blue-800/10 backdrop-blur-sm rounded-lg group-hover:opacity-100" />

          {/* Content */}
          <div className="relative flex items-center justify-between w-full z-10">
            {selectedPair ? (
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <StarIcon filled={favorites.has(selectedPair.id)} />
                    <img src={selectedPair.image} alt={selectedPair.name} className="w-5 h-5 sm:w-7 sm:h-7" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-base sm:text-lg text-white">
                        {selectedPair.symbol.toUpperCase()}/{selectedStableCoin}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:block">{selectedPair.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 ml-3 sm:ml-5">
                  <Icon name="caret down" className="text-gray-400 text-xs sm:text-sm" />
                  <div className={`text-sm sm:text-base font-medium ${selectedPair.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedPair.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <span className="text-base sm:text-lg">Select Pair</span>
                <Icon name="caret down" className="text-gray-400 text-xs sm:text-sm" />
              </div>
            )}
          </div>

          {/* Glass border */}
          <div className="absolute inset-0 border border-blue-500/50 bg-white/5 backdrop-blur-sm transition-all duration-300 rounded-lg" />

          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 transition-all duration-300 rounded-lg group-hover:opacity-100">
            <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent group-hover:animate-[shine_1.5s_ease-in-out]" />
          </div>
        </button>

        {/* Refresh Button */}
        <button
          onClick={fetchCryptoPairs}
          disabled={loading}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          title="Refresh prices"
        >
          {loading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
              <div className="w-full h-full rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            </div>
          ) : (
            <Icon name="refresh" className="text-xs sm:text-sm text-gray-400 group-hover:text-white" />
          )}
        </button>
      </div>

      {/* Modal */}
      <div
        className={`fixed sm:absolute top-0 sm:top-full left-0 mt-0 sm:mt-2 w-full sm:w-[400px] h-full sm:h-auto bg-[#13131F] border-0 sm:border sm:border-gray-800 sm:rounded-lg shadow-lg z-50 transform transition-all duration-300 origin-top ${
          isOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="h-[500px] sm:h-auto overflow-y-auto">
          <div className="sticky top-20 md:top-0 bg-[#13131F] p-4 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select Crypto Pair</h3>
              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <button
                  onClick={fetchCryptoPairs}
                  disabled={loading}
                  className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh prices"
                >
                  {loading ? (
                    <div className="w-5 h-5 relative">
                      <div className="w-full h-full rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                    </div>
                  ) : (
                    <Icon name="refresh" className="text-sm text-gray-400 group-hover:text-white" />
                  )}
                </button>
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center p-2 bg-transparent rounded-lg transition-all duration-300 hover:border-t hover:border-b hover:border-blue-400/50"
                >
                  <Icon name="close" className="text-sm text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mt-4">
              <Icon name="search" className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search crypto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1C28] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Stable Coin Filters */}
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              {stableCoins.map((coin) => (
                <button
                  key={coin}
                  onClick={() => handleStableCoinSelect(coin)}
                  className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
                    selectedStableCoin === coin
                      ? 'text-blue-500 font-medium border border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-sm rounded-lg whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? 'text-blue-500 font-medium border border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Pairs List */}
          <div className="p-4">
            <div className="h-[calc(100vh-280px)] sm:h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                filteredPairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => handlePairSelect(pair)}
                    className={`flex items-center justify-between p-3 hover:bg-[#1C1C28] rounded-lg cursor-pointer group ${
                      selectedPair?.id === pair.id ? 'bg-[#1C1C28]' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        className="hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(pair.id);
                        }}
                      >
                        <StarIcon filled={favorites.has(pair.id)} />
                      </button>
                      <img src={pair.image} alt={pair.name} className="w-6 h-6" />
                      <div>
                        <div className="font-medium">
                          {pair.symbol.toUpperCase()}/{selectedStableCoin}
                        </div>
                        <div className="text-sm text-gray-400">{pair.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>${formatPrice(pair.current_price)}</div>
                      <div className={pair.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {pair.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};