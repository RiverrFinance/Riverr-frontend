import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Pairs } from "./Pairs";
import { Asset, Market, quoteCurrencies } from "../../../../lists/marketlist";
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

  const toggleFavorite = useCallback((chartId: string) => {
    console.log("Toggling:", chartId);
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.has(chartId)
        ? newFavorites.delete(chartId)
        : newFavorites.add(chartId);
      console.log("New favorites:", Array.from(newFavorites));
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
        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "string")
        ) {
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
    const matchesSearch =
      market.baseAsset.symbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      market.baseAsset.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Favorites tab shows all favorited pairs regardless of quote currency
    if (activeTab === "Favorites") {
      return favorites.has(market.chartId) && matchesSearch;
    }

    // Other tabs filter by selected quote currency
    const matchesQuoteCurrency =
      market.quoteAsset.priceID === selectedQuoteCurrency.priceID;

    const matchesTab = activeTab === "All";
    return matchesQuoteCurrency && matchesSearch && matchesTab;
  });

  return (
    <div className="relative glass px-6 py-4 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 max-xs:justify-evenly max-md:w-full">
        <div className="flex items-center">
          <button
            title="Close"
            type="button"
            className="hover:scale-110 transition-transform mr-3 focus:outline-none p-2 rounded-lg hover:bg-white/10"
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
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:bg-white/5 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-3 text-white text-lg font-bold focus:outline-none">
                {selectedMarket.baseAsset.logoUrl && (
                  <img
                    src={selectedMarket.baseAsset.logoUrl}
                    alt={selectedMarket.baseAsset.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex items-center">
                  <span className="max-sm:text-sm">
                    {selectedMarket.baseAsset.symbol} /{" "}
                    {selectedMarket.quoteAsset.symbol}
                  </span>

                  <ChevronDown className="w-5 h-5 ml-2" />
                </div>
              </div>
              <div className="text-gray-400 text-sm max-xs:text-xs ml-11 max-sm:ml-8">
                {selectedMarket.baseAsset.name}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bg-[#0A1022] top-full left-0 max-xs:-left-8 mt-3 w-80 sm:w-96 rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <span className="text-white font-semibold">
                    Select Crypto Pair
                  </span>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Close"
                    type="button"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                  <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <Search className="w-4 h-4 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder="Search crypto"
                      className="w-full bg-transparent border-none focus:outline-none text-white text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Quote Currency Tabs */}
                <div className="relative p-2 mx-4 mb-4">
                  <div className="flex relative z-10">
                    {quoteCurrencies.map((currency) => (
                      <button
                        type="button"
                        key={currency.priceID}
                        onClick={() => setSelectedQuoteCurrency(currency)}
                        className="flex-1 py-3 px-3 text-sm font-medium relative transition-colors duration-300"
                      >
                        <span
                          className={`relative z-10 flex items-center justify-center gap-2 ${
                            selectedQuoteCurrency === currency
                              ? "text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {currency.logoUrl && (
                            <img
                              src={currency.logoUrl}
                              alt={currency.symbol}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          {currency.symbol}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Sliding background */}
                  <div
                    className="absolute top-2 h-[calc(100%-16px)] w-[calc(50%-8px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out rounded-lg"
                    style={{
                      transform: `translateX(${
                        selectedQuoteCurrency.priceID ===
                        quoteCurrencies[0].priceID
                          ? "0%"
                          : "100%"
                      })`,
                    }}
                  />
                </div>

                {/* Filtering Tabs (All, Favorites ) */}
                <div className="relative p-2 mx-4 mb-4">
                  <div className="flex relative z-10">
                    {tabs.map((tab) => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-1 py-3 px-3 text-sm font-medium relative transition-colors duration-300"
                      >
                        <span
                          className={`relative z-10 ${
                            activeTab === tab
                              ? "text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {tab}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Sliding background */}
                  <div
                    className="absolute top-2 h-[calc(100%-16px)] w-[calc(50%-8px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out rounded-lg"
                    style={{
                      transform: `translateX(${
                        activeTab === "All" ? "0%" : "100%"
                      })`,
                    }}
                  />
                </div>

                {/* List of Pairs (Filtered) */}
                <div className="max-h-60 overflow-y-auto p-2">
                  {filteredMarkets.map((market) => (
                    <div
                      key={market.chartId}
                      onClick={() => {
                        onMarketSelect(market);
                        setIsDropdownOpen(false);
                      }}
                      className="hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
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
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    className="text-blue-500 transition-colors"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
