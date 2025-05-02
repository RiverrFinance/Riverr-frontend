import { useState, useEffect, useCallback } from "react";
import { Icon } from "semantic-ui-react";
import { Pairs } from "./Pairs";
import {
  Asset,
  Market,
  markets,
  quoteCurrencies,
} from "../../../lists/marketlist";
import { AccessList } from "ethers/lib/utils";
import MarketPrice from "./MarketPrice";


// import { toast } from 'sonner';

export interface MarketSelectorProps {
  onMarketSelect: (pair: Market) => void;
  selectedMarket: Market;
  markets: Market[];
}

interface PriceDetails {
  price: number;
  price_change_24h: number;
  high_24h?: number;
  low_24h?: number;
  volume?: number;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({
  // onMarketSelect: onPairSelect,
  onMarketSelect,
  selectedMarket,
  markets,
}) => {
  const [selectedQuoteCurrency, setSelectedQuoteCurrency] = useState<Asset>(
    quoteCurrencies[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [priceData, setPriceData] = useState<PriceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // set means no duplicates it helps to store unique values and it is faster than array for searching and deleting

  const tabs = ["All", "Favorites"];

  const toggleFavorite = useCallback((marketId: string) => {
    console.log('Toggling:', marketId); 
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.has(marketId) 
        ? newFavorites.delete(marketId)
        : newFavorites.add(marketId);
      console.log('New favorites:', Array.from(newFavorites)); 
      return newFavorites;
    });
  }, []);

  // Load favorites from local storage on initial mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        // Validate it's an array of strings
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
          setFavorites(new Set(parsed));
        }
      }
    } catch (e) {
      // console.error("Failed to load favorites:", e);
      localStorage.removeItem("favorites");
    }
  }, []);
  
  useEffect(() => {
    const saveFavorites = () => {
      try {
        localStorage.setItem(
          "favorites",
          JSON.stringify(Array.from(favorites))
        );
      } catch (e) {
        // console.error("Failed to save favorites:", e);
      }
    };
  
    // Debounce to prevent excessive writes
    const debounceTimer = setTimeout(saveFavorites, 500);
    return () => clearTimeout(debounceTimer);
  }, [favorites]);

  const filteredMarkets = markets.filter((market) => {
    const matchesQuoteCurrency = 
      market.quoteAsset.priceID === selectedQuoteCurrency.priceID;
    
    const matchesSearch = 
      market.baseAsset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.baseAsset.name.toLowerCase().includes(searchQuery.toLowerCase());
  
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Favorites" && favorites.has(market.chartId))
  
    return matchesQuoteCurrency && matchesSearch && matchesTab;
  });

  return (
    <div className="relative bg-transparent px-3 pt-0 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            title="Close"
            type="button"
            className="hover:scale-110 transition-transform mr-2 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // if (selectedMarket?.chartId) {
                toggleFavorite(selectedMarket.chartId);
              // }
            }}
          >
            <StarIcon
              filled={
                selectedMarket?.chartId
                  ? favorites.has(selectedMarket.chartId)
                  : false
              }
            />
          </button>

          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-white text-lg font-bold focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedMarket.baseAsset.logoUrl && (
                <img 
                  src={selectedMarket.baseAsset.logoUrl} 
                  alt={selectedMarket.baseAsset.symbol}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="flex items-center">
                {selectedMarket.baseAsset.symbol.toUpperCase()} /{" "}
                {selectedMarket.quoteAsset.symbol.toUpperCase()}
                <Icon
                  name={`caret ${isDropdownOpen ? "up" : "down"}`}
                  className="ml-1 text-gray-400"
                />
              </div>
            </button>
            <div className="text-gray-400 text-sm ml-8">
              {selectedMarket.baseAsset.name}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 p-5 bg-[#18191D] rounded-md shadow-lg z-10 overflow-hidden border-2 border-dashed border-[#363c52] border-opacity-40">
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-white font-semibold">
                    Select Crypto Pair
                  </span>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                    title="Close"
                    type="button"
                  >
                    <Icon name="close" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="pt-5">
                  <div className="flex items-center bg-[#242529] rounded-md px-3 py-2">
                    <Icon name="search" className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search crypto"
                      className="w-full bg-transparent border-none focus:outline-none text-white text-sm mt-1"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Quote Currency Tabs */}
                <div className="relative p-1 my-3">
                  <div className="flex relative z-10">
                    {quoteCurrencies.map((currency) => (
                      <button
                        type="button"
                        key={currency.priceID}
                        onClick={() => setSelectedQuoteCurrency(currency)}
                        className="flex-1 py-2 px-2 text-xs font-medium relative transition-colors duration-300"
                      >
                        <span className={`relative z-10 flex items-center justify-center gap-2 ${
                          selectedQuoteCurrency === currency 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}>
                          {currency.logoUrl && (
                            <img 
                              src={currency.logoUrl} 
                              alt={currency.symbol}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          {currency.symbol}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Sliding background */}
                  <div 
                    className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-0px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
                    style={{
                      transform: `translateX(${selectedQuoteCurrency.priceID === quoteCurrencies[0].priceID ? "0%" : "100%"})`,
                    }}
                  />
                </div>

                {/* Filtering Tabs (All, Favorites ) */}
                <div className="relative p-1 mb-3">
                  <div className="flex relative z-10">
                    {tabs.map((tab) => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-1 py-2 px-2 text-xs font-medium relative transition-colors duration-300"
                      >
                        <span className={`relative z-10 ${
                          activeTab === tab 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}>
                          {tab}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Sliding background */}
                  <div 
                    className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-0px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out rounded-sm"
                    style={{
                      transform: `translateX(${activeTab === "All" ? "0%" : "100%"})`,
                    }}
                  />
                </div>

                {/* List of Pairs (Filtered) */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredMarkets.map((market) => (
                    <div
                      key={market.chartId}
                      onClick={() => {
                        onMarketSelect(market);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Pairs
                        market={market}
                        favorites={favorites}
                        isSelected={selectedMarket.chartId === market.chartId}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right side: Market Details */}
        <div className="flex items-center">
          <MarketPrice market={selectedMarket} />
        </div>
      </div>
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
