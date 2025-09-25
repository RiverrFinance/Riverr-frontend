import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Pairs } from "./Pairs";
import { Asset, Market, quoteCurrencies } from "../../../../lists/marketlist";
import MarketPrice from "./MarketPrice";

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
  onMarketSelect,
  selectedMarket,
  markets,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // set keyword means to store unique values only

  const getMarketUniqueId = (market: Market): string => {
    return `${market.baseAsset.priceID} - ${market.quoteAsset.priceID}- ${market.chartId}`; // this means each market is uniquely identified by its base, quote assets and chart ID
  };
  
  const tabs = [
    "All",
    "Favorites",
    ...quoteCurrencies.map((c) => c.symbol.toUpperCase()),
  ];

  const toggleFavorite = useCallback((marketId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(marketId)) {
        newFavorites.delete(marketId);
      } else {
        newFavorites.add(marketId);
      }
      return newFavorites;
    });
  }, []);

  // useMemo is used to memoize the filtered markets based on the search query and active tab 
  const filteredMarkets = useMemo(() => {
    let filtered = [...markets];

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(market => {
        const uniqueId = getMarketUniqueId(market);
        return (
          market.baseAsset.symbol.toLowerCase().includes(searchLower) ||
          market.baseAsset.name.toLowerCase().includes(searchLower) ||
          uniqueId.toLowerCase().includes(searchLower)
        );
      });
    }

    // Tab filter
    if (activeTab === "Favorites") {
      filtered = filtered.filter(m => {
        const uniqueId = getMarketUniqueId(m);
        return favorites.has(uniqueId);
      });
    } else if (activeTab !== "All") {
      const selectedQuoteCurrency = quoteCurrencies.find(
        c => c.symbol.toUpperCase() === activeTab
      );

      if (selectedQuoteCurrency) {
        filtered = filtered.filter(m => m.quoteAsset.priceID === selectedQuoteCurrency.priceID);
      }
    }

    return filtered;
  }, [searchQuery, activeTab, favorites]);

  // The above useMemo hook ensures that filteredMarkets is recalculated only when searchQuery, activeTab, or favorites change.

  return (
    <div className="relative glass px-6 py-4 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 max-xs:justify-evenly max-md:w-full">
        <div className="flex items-center">
          {/* <button
            title="Toggle Favorite"
            type="button"
            className="hover:scale-110 transition-transform mr-3 focus:outline-none p-2 rounded-lg hover:bg-white/10"
                          onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
                            if (selectedMarket.market_id) {
                              toggleFavorite(selectedMarket.market_id);
                            }
            }}
          >
            <StarIcon filled={selectedMarket.market_id ? favorites.has(selectedMarket.market_id) : false} />
          </button> */}

          {/* Pair Selector */}
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
                    {selectedMarket.baseAsset.symbol.toUpperCase()} /{" "}
                    {selectedMarket.quoteAsset.symbol.toUpperCase()}
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
              <div className="absolute bg-[#111322] top-full left-0 max-xs:-left-8 mt-3 w-96 sm:w-[28rem] md:w-[56rem] rounded-2xl shadow-lg z-50 overflow-hidden border border-gray-700/50">
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

                {/* Filtering Tabs */}
                <div className="relative p-2 mx-4 mb-4">
                  <div className="flex gap-7 z-10 overflow-x-auto">
                    {tabs.map(tab => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                        }}
                        className={`px-3 py-1.5 whitespace-nowrap transition-transform text-sm shadow-lg flex justify-center items-center gap-2 relative group rounded-md ${
                          activeTab === tab
                            ? 'bg-white/15 text-white shadow-lg'
                            : 'text-gray-400/40 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                          {quoteCurrencies.find(
                            (c) => c.symbol.toUpperCase() === tab
                          )?.logoUrl && (
                            <img
                              src={
                                quoteCurrencies.find(
                                  (c) => c.symbol.toUpperCase() === tab
                                )?.logoUrl
                              }
                              alt={tab}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          {tab}
                          {tab === "Favorites" && favorites.size > 0 && (
                            <span className="bg-yellow-500 text-black text-[8px] px-1.5 py-0.1 rounded-full">
                              {favorites.size}
                            </span>
                          )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column Headers */}
                <div className="px-4 py-2 border-b border-gray-700/30">
                  <div className="grid grid-cols-6 gap-4 text-xs text-gray-400 uppercase tracking-wide">
                    <div className="col-span-2">MARKET</div>
                    <div className="text-right">LAST PRICE</div>
                    <div className="text-right">24H%</div>
                    <div className="text-right">OPEN INTEREST</div>
                    <div className="text-right">AVAILABLE LIQ.</div>
                  </div>
                </div>

                {/* List of Pairs (Filtered) */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredMarkets.length > 0 ? (
                    filteredMarkets.map(market => {
                      const uniqueId = getMarketUniqueId(market);
                      return (
                        <div
                          key={market.market_id}
                          onClick={() => {
                            onMarketSelect(market);
                            setIsDropdownOpen(false);
                          }}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Pairs
                            market={market}
                            favorites={favorites.has(uniqueId)}
                            onToggleFavorite={() => toggleFavorite(uniqueId)}
                          />
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      {activeTab === "Favorites"
                        ? "No favorites added yet"
                        : searchQuery
                        ? "No markets found"
                        : "No markets available"}
                    </div>
                  )}
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