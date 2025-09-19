import { useState, useEffect, useCallback } from "react";
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

  // All tabs including quote currencies
  const allTabs = [
    "All",
    "Favorites",
    ...quoteCurrencies.map((c) => c.symbol.toUpperCase()),
  ];

  const toggleFavorite = useCallback((marketId: string) => {
    console.log("toggleFavorite in MarketSelector", marketId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(marketId)) next.delete(marketId);
      else next.add(marketId);
      return next;
    });
  }, []);

  useEffect(() => {
    // Initialize with empty favorites set
    setFavorites(new Set());
  }, []);

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      (market.market_id || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      market.baseAsset.symbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      market.quoteAsset.symbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (activeTab === "Favorites") {
      return favorites.has(market.market_id || "") && matchesSearch;
    }

    const selectedQuoteCurrency = quoteCurrencies.find(
      (c) => c.symbol.toUpperCase() === activeTab
    );

    if (selectedQuoteCurrency) {
      const matchesQuoteCurrency =
        market.quoteAsset.priceID === selectedQuoteCurrency.priceID;
      return matchesQuoteCurrency && matchesSearch;
    }

    return matchesSearch;
  });

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
                  <div className="flex z-10 overflow-x-auto">
                    {allTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-shrink-0 py-3 px-4 text-sm font-medium relative z-10"
                      >
                        <span
                          className={`relative flex items-center gap-2 ${
                            activeTab === tab
                              ? "text-white"
                              : "text-gray-400 hover:text-white"
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
                            <span className="ml-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded-full">
                              {favorites.size}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Fixed sliding background */}
                  <div
                    className="absolute top-0 h-full bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out rounded-lg"
                    style={{
                      width: `${
                        allTabs
                          .map((tab) => tab.length)
                          .reduce((a, b) => Math.max(a, b)) *
                          8 +
                        32
                      }px`,
                      transform: `translateX(${
                        allTabs.indexOf(activeTab) * (100 / allTabs.length)
                      }%)`,
                    }}
                  />
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
                    filteredMarkets.map((market) => (
                      <div
                        key={market.chartId}
                        onClick={() => {
                          onMarketSelect(market);
                          setIsDropdownOpen(false);
                        }}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Pairs
                          market={market}
                          favorites={favorites}
                          isSelected={selectedMarket.chartId === market.chartId}
                          onToggleFavorite={(id) => toggleFavorite(id)}
                        />
                      </div>
                    ))
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
