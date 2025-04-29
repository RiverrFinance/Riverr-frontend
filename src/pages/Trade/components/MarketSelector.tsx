import { useState, useEffect } from "react";
import { Icon } from "semantic-ui-react";
import { Pairs } from "./Pairs";
import {
  Asset,
  Market,
  markets,
  quoteCurrencies,
} from "../../../lists/marketlist";
import { AccessList } from "ethers/lib/utils";

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
  markets
}) => {
  const [selectedQuoteCurrency, setSelectedQuoteCurrency] = useState<Asset>(
    quoteCurrencies[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Renamed from isOpen
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // Changed to Set for better performance, set means no duplicates it helps to store unique values and it is faster than array for searching and deleting

  const tabs = ["All", "Favorites", "Top Volume"];

  const toggleFavorite = (marketId: string) => { 
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(marketId)) {
        newFavorites.delete(marketId);
      } else {
        newFavorites.add(marketId);
      }
      // Persist favorites to local storage
      // localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  // Load favorites from local storage on initial mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (e) {
        console.error("Failed to parse favorites from local storage:", e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    } catch (e) {
      console.error("Failed to save favorites to local storage:", e);
    }
  }, [favorites]); 



  // Filter markets based on selected quote currency, search query, and active tab
  const filteredMarkets = markets.filter(market => {
    // Filter by selected quote currency
    const matchesQuoteCurrency = market.quoteAsset.priceID === selectedQuoteCurrency.priceID; // Assuming priceID is a unique identifier for Asset

    // Filter by search query (checking base asset symbol and name)
    const matchesSearch =
      market.baseAsset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.baseAsset.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by active tab
    const matchesTab = activeTab === 'All' || (activeTab === 'Favorites' && favorites.has(market.chartId));

    return matchesQuoteCurrency && matchesSearch && matchesTab;
  });

  const currentPrice = "60,423.71";
  const priceChange24h = "+1.25 %";
  const high24h = "61,234.12";
  const low24h = "59,344.32";
  const volume24h = "259.91M"; 


  // const formatPrice = (price: number | string) => { 
  //   if (typeof price === 'string') return price; 
  //   if (!price) return "0.00";
  //   return price < 1
  //     ? price.toFixed(6)
  //     : price.toLocaleString(undefined, {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       });
  // };

  //  // Function to format percentage (copied from your Pairs component)
  //  const formatPercent = (percent: number | string) => { // Added string type for placeholder
  //    if (typeof percent === 'string') return percent; // Handle placeholder string
  //    if (!percent) return "0.00";
  //    return percent.toFixed(2);
  //  };

  return (
    <div className="relative bg-transparent p-3 pt-0 rounded-md"> 
      <div className="flex items-center justify-between">
        <div className="flex items-center">
           <button
             title="Close" 
             type="button" 
             className="hover:scale-110 transition-transform mr-2 focus:outline-none" 
             onClick={(e) => {
               e.stopPropagation();
               toggleFavorite(selectedMarket.chartId); 
             }}
           >
             <StarIcon filled={selectedMarket?.chartId ? favorites.has(selectedMarket.chartId) : false} />
           </button>


          <div className="relative">
            <button
              type="button" 
              className="flex items-center text-white text-lg font-bold focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            >
              {selectedMarket.baseAsset.symbol.toUpperCase()} / {selectedMarket.quoteAsset.symbol.toUpperCase()}
              <Icon name={`caret ${isDropdownOpen ? 'up' : 'down'}`} className="ml-1 text-gray-400" />
            </button>
            <div className="text-gray-400 text-sm">{selectedMarket.baseAsset.name}</div> 

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 p-5 bg-[#18191D] rounded-md shadow-lg z-10 overflow-hidden"> 
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                   <span className="text-white font-semibold">Select Crypto Pair</span> 
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
                <div className="p-3 border-b border-gray-700">
                   <div className="flex items-center bg-[#242529] rounded-md px-3 py-2"> 
                       <Icon name="search" className="text-gray-400 mr-2" />
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
                <div className="flex gap-2 p-3 border-b border-gray-700 overflow-x-auto"> 
                  {quoteCurrencies.map((currency) => (
                    <button
                      type="button" 
                      key={currency.priceID}
                      onClick={() => setSelectedQuoteCurrency(currency)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                        selectedQuoteCurrency === currency
                          ? "bg-blue-500 text-white"
                          : "bg-[#1C1C28] text-gray-400 hover:text-white"
                      }`}
                    >
                      {currency.symbol}
                    </button>
                  ))}
                </div>

                {/* Filtering Tabs (All, Favorites, Top Volume) */}
                 <div className="flex gap-2 p-3 border-b border-gray-700 overflow-x-auto"> 
                   {tabs.map(tab => (
                     <button
                       type="button" 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 flex-shrink-0 ${ 
                         activeTab === tab
                           ? "bg-blue-500 text-white"
                           : "bg-[#1C1C28] text-gray-400 hover:text-white"
                       }`}
                     >
                       {tab}
                     </button>
                   ))}
                 </div>


                {/* List of Pairs (Filtered) */}
                <div className="max-h-60 overflow-y-auto"> 
                  {filteredMarkets.map((market) => (
                    <div
                      key={market.chartId} 
                      onClick={() => {
                        onMarketSelect(market); // Call the parent's select handler
                        setIsDropdownOpen(false); 
                      }}
                    >
                      <Pairs
                        market={market}
                        favorites={favorites}
                        isSelected={selectedMarket.chartId === market.chartId} // Check if this market is currently selected
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
        <div className="flex items-center space-x-6 text-sm text-gray-400">
         
          <div>
            <div className="">Price</div> 
            <div className="text-white font-semibold">{currentPrice}</div>
          </div>
          
          <div>
            <div className="">24h Change</div>
            <div className={`font-semibold ${priceChange24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange24h}
            </div>
          </div>
          
          <div>
            <div className="">24h High</div>
            <div className="text-white font-semibold">{high24h}</div>
          </div>
         
          <div>
            <div className="">24h Low</div>
            <div className="text-white font-semibold">{low24h}</div>
          </div>
          
          <div>
             <div className="">24h Volume</div>
            <div className="text-white font-semibold">{volume24h}</div>
          </div>
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
