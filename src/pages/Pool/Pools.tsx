import { useMemo, useState, useCallback } from "react";
import { Info, Search } from "lucide-react";
import { Market, markets, quoteCurrencies } from "../../lists/marketlist";
import { PoolDetails } from "./PoolDetails";
import { Pagination } from "../../components/Pagination";
import { PoolRow } from "./PoolRow";

export const  Pools = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const itemsPerPage = 10;

  // Create unique identifier for each market using combination of base and quote assets (this is for the favorite function)
  const getMarketUniqueId = (market: Market): string => {
    return `${market.baseAsset.priceID}-${market.quoteAsset.priceID}-${market.chartId}`;
  };

  const tabs = [
    "All",
    "Favorites", 
    ...quoteCurrencies.map(c => c.symbol.toUpperCase())
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
          market.quoteAsset.symbol.toLowerCase().includes(searchLower) ||
          market.quoteAsset.name.toLowerCase().includes(searchLower) ||
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
      const quoteCurrency = quoteCurrencies.find(
        c => c.symbol.toUpperCase() === activeTab
      );
      if (quoteCurrency) {
        filtered = filtered.filter(m => m.quoteAsset.priceID === quoteCurrency.priceID);
      }
    }

    return filtered;
  }, [searchQuery, activeTab, favorites]);

  const totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);
  const paginatedMarkets = filteredMarkets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (market: Market) => {
    setSelectedMarket(market);
  };

  const handleBackToPoolPage = () => {
    setSelectedMarket(null);
  };

  if (selectedMarket) {
    return <PoolDetails market={selectedMarket} onBack={handleBackToPoolPage} />;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="py-2 px-4 lg:py-4 lg:px-8">
        <div className="w-full space-y-10">
          {/* Header */}
          <div className="mb-2 glass rounded-2xl border border-white/10 glass p-10 space-y-3 shadow-lg">
            <h1 className="text-2xl lg:text-4xl font-bold mb-1 text-white">GM Pools</h1>
            <p className="text-gray-400 text-base lg:text-lg max-w-2xl">
              Pools providing liquidity to specific GMX markets, supporting single-asset and native-asset options.
            </p>
          </div>

          {/* Search & Tabs Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 mx-5">
            <div className="relative max-w-xs w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Pools"
                className="w-full glass bg-[#16182e] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#4f60ff] transition-colors text-base shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:ml-4">
              {tabs.map(tab => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all text-base border border-white/10 shadow-sm ${
                    activeTab === tab
                      ? 'hover:bg-gradient-to-r hover:from-[#140242] hover:to-[#02074c]  text-white shadow-lg'
                      : 'text-gray-400/40 hover:bg-gradient-to-r hover:from-[#1402425b] hover:to-[#02074c59] hover:text-white'
                  }`}
                >
                  {tab}
                  {tab === "Favorites" && favorites.size > 0 && (
                    <span className="ml-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full">
                      {favorites.size}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pool List */}
          <div className="space-y-4">
            <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden h-full">
            
              {/* Header */}
              <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-700 bg-[#111322]">
                {/* Pool */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-3 flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm lg:text-base font-bold uppercase tracking-wide">
                  <span>Pool</span>
                  <Info size={14} className="text-gray-600 sm:block hidden" />
                </div>

                {/* TVL (Supply) */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 text-right lg:text-left text-gray-400 text-xs sm:text-sm lg:text-base font-bold uppercase tracking-wide flex items-center justify-end lg:justify-start gap-1">
                  <span className="hidden sm:inline">TVL</span>
                  <span className="sm:hidden">TVL</span>
                  <span className="text-gray-600 hidden sm:inline">$</span>
                </div>

                {/* Reserved Factor */}
                <div className="hidden lg:flex col-span-2 items-center gap-2 text-gray-400 text-sm lg:text-base font-bold uppercase tracking-wide">
                  <span>Reserved Factor</span>
                </div>

                {/* Total OI */}
                <div className="hidden sm:flex col-span-2 lg:col-span-2 items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm lg:text-base font-bold uppercase tracking-wide justify-center lg:justify-start">
                  <span>Total OI</span>
                  <Info size={14} className="text-gray-600" />
                </div>

                {/* Snapshot */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-2 text-right text-gray-400 text-xs sm:text-sm lg:text-base font-bold uppercase tracking-wide flex items-center justify-end gap-1">
                  <span className="hidden sm:inline">Snapshot</span>
                  <span className="sm:hidden">Chart</span>
                  <Info size={14} className="text-gray-600 hidden sm:block" />
                </div>
              </div>

              {/* Pool Rows */}
              <div>
                {paginatedMarkets.length > 0 ? (
                  paginatedMarkets.map(market => {
                    const uniqueId = getMarketUniqueId(market);
                    return (
                      <PoolRow
                        key={uniqueId}
                        market={market}
                        isFavorite={favorites.has(uniqueId)}
                        onToggleFavorite={() => toggleFavorite(uniqueId)}
                        onRowClick={handleRowClick}
                      />
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <Search size={48} className="text-gray-700" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-2">
                          {activeTab === "Favorites" ? "No Favorite Pools" : "No Pools Found"}
                        </h3>
                        <p className="text-gray-600">
                          {activeTab === "Favorites" 
                            ? "Click the heart icon on any pool to add it to your favorites."
                            : searchQuery 
                              ? "Try adjusting your search terms or browse all pools."
                              : "No pools available at the moment."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mx-5">
                <div className="text-gray-400 text-sm">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMarkets.length)} to {Math.min(currentPage * itemsPerPage, filteredMarkets.length)} of {filteredMarkets.length} pools
                </div>
                <Pagination
                  page={currentPage}
                  pageCount={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 glass rounded-2xl p-6 border border-white/10 shadow-lg">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Pool Information</h3>
                <p className="text-gray-400 text-sm">
                  GM pools provide single-asset liquidity to GMX markets, earning fees from trading activity and market making.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Risk Factors</h3>
                <p className="text-gray-400 text-sm">
                  Pool tokens are subject to market volatility, trading losses, and smart contract risks. Past performance does not guarantee future results.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Fee Structure</h3>
                <p className="text-gray-400 text-sm">
                  Pools earn fees from trading activity, borrowing costs, and funding payments, distributed proportionally to liquidity providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
