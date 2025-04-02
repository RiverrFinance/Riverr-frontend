import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Asset, assetList, quoteCurrencies } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { AssetComponent } from "./AssetComponent";
import { useAgent } from "@nfid/identitykit/react";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { fetchDetails } from "../../utils/utilFunction";
import { formatUnits } from "ethers/lib/utils";
import FundingPopUp from "./FundingPopUp"
import WithdrawPopUp from "./WithdrawPopUp";

const ICP_API_HOST = "https://icp-api.io/";
const COIN_GECKO_API_URL = "https://api.coingecko.com/api/v3";

interface PriceDetails {
  price: number;
  price_change_24h: number;
}

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  isFavorite?: boolean;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  pairAddress: string;
  chainId: string;
  dexId: string;
}

export function Dashboard() {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [pricesArray, setPricesArray] = useState<number[]>([]);
  const [balancesArray, setBalancesArray] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedAssetName, setSelectedAssetName] = useState<string | undefined>(undefined);

  const [topMovers, setTopMovers] = useState<CoinGeckoMarketData[]>([]);
  const topPriorityCoinIds = ["bitcoin", "ethereum", "binancecoin", "aave", "solana", "ripple", "internet-computer", "usd-coin"];


  const openDepositModal = (assetName: string) => {
    setSelectedAssetName(assetName);
    setIsDepositModalOpen(true);
  };
  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setSelectedAssetName(undefined);
  };

  const openWithdrawModal = (assetName: string) => {
    setSelectedAssetName(assetName);
    setIsWithdrawModalOpen(true);
  };
  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setSelectedAssetName(undefined);
  };



  const fetcherUserMarginBalance = async (asset: Asset): Promise<bigint> => {
    try {
      if (asset.vaultID && readWriteAgent) {
        let user = await readWriteAgent.getPrincipal();
        let vaultActor = new VaultActor(asset.vaultID, readAgent);
        const balance = await vaultActor.userMarginBalance(user);
        return balance;
      }
      return 0n;
    } catch {
      return 0n;
    }
  };

  const fetchAssetPrice = async (asset: Asset): Promise<number> => {
    let response = await fetchDetails(asset.priceID);
    let assetValueDetails: PriceDetails = await response.json();
    let { price } = assetValueDetails;
    return price;
  };

  const getUserAssetValue = async (asset: Asset): Promise<[number, string]> => {
    let price = await fetchAssetPrice(asset);
    let userMargin = await fetcherUserMarginBalance(asset);
    return [price, formatUnits(userMargin, asset.decimals)];
  };

  const updateValueDetails = async () => {
    try {
      let sendPromiseList: Promise<[number, string]>[] = assetList.map(
        (asset) => getUserAssetValue(asset)
      );
      let resolvedPromiseList: [number, string][] = await Promise.all(
        sendPromiseList
      );
      const prices = resolvedPromiseList.map(([price]) => price);
      const balances = resolvedPromiseList.map(([, balance]) => balance);

      setPricesArray(prices);
      setBalancesArray(balances);
    } catch {}
  };

  const changeTotalValue = () => {
    let valueSum = 0;
    pricesArray.forEach((price, index) => {
      let balance = balancesArray[index] || 0n;
      // let refAsset = assetList[index];
      let currentValue = price * Number(balance);
      valueSum += currentValue;
    });
    setTotalValue(valueSum);
    console.log(totalValue);
  };

  // const fetchTopMovers = useCallback(async () => {
  //   try {
  //     const currency = "usd";

  //     const topPriorityResponse = await fetch(
  //       `${COIN_GECKO_API_URL}/coins/markets?vs_currency=${currency}&ids=${topPriorityCoinIds.join(
  //         ","
  //       )}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
  //     );
  //     if (!topPriorityResponse.ok) {
  //       throw new Error(`HTTP error fetching top priority coins! status: ${topPriorityResponse.status}`);
  //     }
  //     const topPriorityData: CoinGeckoMarketData[] = await topPriorityResponse.json();

  //     //fetch all other coins
  //     const allCoinsResponse = await fetch(
  //       `${COIN_GECKO_API_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
  //     );
  //     if (!allCoinsResponse.ok) {
  //       throw new Error(`HTTP error fetching all coins! status: ${allCoinsResponse.status}`);
  //     }
  //     const allCoinsData: CoinGeckoMarketData[] = await allCoinsResponse.json();

  //     // Filtering top priority coins from others (no duplicates)
  //     const otherCoinsData = allCoinsData.filter(coin => !topPriorityCoinIds.includes(coin.id));

  //     const combinedTopMovers = [...topPriorityData, ...otherCoinsData];

  //     setTopMovers(combinedTopMovers);
  //   } catch (error) {
  //     console.error("Error fetching top movers:", error);
  //   }
  // }, [topPriorityCoinIds]);

  // useEffect(() => {
  //   fetchTopMovers();
  //   const interval = setInterval(fetchTopMovers, 10000); // Fetch every 10s
  //   return () => clearInterval(interval);
  // }, [fetchTopMovers]);

  useEffect(() => {
    if (readWriteAgent) {
      changeTotalValue();
    } else {
      setTotalValue(0);
    }
  }, [
    readWriteAgent,
    JSON.stringify(balancesArray),
    JSON.stringify(pricesArray),
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateValueDetails();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  return (
    <div className="h-full bg-transparent rounded-3xl grid md:grid-cols-12 md:gap-5 gap-10">
      <div className="md:space-y-6 space-y-3 md:col-span-8">
        <div className="py-5 px-5 h-fit bg-[#18191D] rounded-2xl md:rounded-3xl">
          <div className="bg-[#0300AD] rounded-lg md:rounded-2xl py-10 md:px-5 px-12 h-fit flex flex-col max-xs:items-center">
            <div className="text-3xl font-black tracking-wide mb-4">Dashboard</div>
            <div className="space-y-1 flex flex-col max-xs:items-center">
              <div className="text-md text-gray-300">Total Balance</div>
              <div className="text-2xl font-bold">${formatPrice(totalValue)} <small className="uppercase text-xs">usdt</small></div>
              <div className="text-sm text-gray-400">100 icp</div>
            </div>        
          </div>          
        </div>

        <div className="py-8 px-5 h-full bg-[#18191D] rounded-2xl md:rounded-3xl">
          <div className="text-2xl font-bold mb-4 capitalize">portfolio</div>
          <div>
            <AssetListComponent
              pricesArray={pricesArray}
              balancesArray={balancesArray}
              // openDepositModal={openDepositModal}
              // openWithdrawModal={openWithdrawModal}
            />                      
          </div>
       
        </div>
      </div>
      <div className="md:col-span-4 pt-7 pb-4 px-7 h-full bg-[#18191D] rounded-2xl md:rounded-3xl">
        <div className="capitalize flex">
          <h2 className="text-2xl">top movers</h2>
        </div>
        <TopMoversComponent topMovers={topMovers} />
      </div>
      {/* <FundingPopUp isOpen={isDepositModalOpen} onClose={closeDepositModal} asset={selectedAssetName} />
      <WithdrawPopUp isOpen={isWithdrawModalOpen} onClose={closeWithdrawModal} asset={selectedAssetName} /> */}
    </div>
  );
}

interface AssetListsProps {
  pricesArray: number[];
  balancesArray: string[];
  // openDepositModal: (assetName: string) => void; 
  // openWithdrawModal: (assetName: string) => void;
}
const AssetListComponent = memo(
  function Component({ pricesArray, balancesArray, openDepositModal, openWithdrawModal }: AssetListsProps) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between py-2 text-xs text-gray-500 capitalize">
          <div className="w-1/3">Asset</div>
          <div className="w-1/3 text-right">Balance</div>
          <div className="w-1/3 text-right">Value</div>
          <div className="w-1/3 text-right"></div>
        </div>
        {assetList.map((asset, index) => {
          const price = pricesArray[index] || 0;
          const userBalance = balancesArray[index] || "0.00";

          return (
            <div key={asset.name}>
              <AssetComponent
                asset={asset}
                price={price}
                userBalance={userBalance}
                openDepositModal
                openWithdrawModal
              />              
            </div>
          );
        })}
      </div>
    );
  },
  (prevProps: AssetListsProps, newProps: AssetListsProps): boolean => {
    return (
      JSON.stringify(prevProps.pricesArray) ==
        JSON.stringify(newProps.pricesArray) &&
      JSON.stringify(prevProps.balancesArray) ==
        JSON.stringify(newProps.balancesArray)
    );
  }
);



interface TopMoversProps {
  topMovers: CoinGeckoMarketData[];
}

const TopMoversComponent = memo(
  ({ topMovers }: TopMoversProps) => {
    return (
      <div className="mt-10 max-h-[500px] overflow-y-scroll overflow-x-hidden">
        <div className="flex flex-col gap-3">
          {topMovers.map((coin) => (
            <div
              key={coin.id}
              className="py-4 grid grid-cols-12 items-center justify-between"
            >
              <div className="col-span-6 flex items-center">
                <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-2" />
                <div>
                  <div className="text-sm font-semibold">{coin.name}</div>
                  <div className="text-xs text-gray-500">{coin.symbol.toUpperCase()}</div>
                </div>
              </div>
              <div
                className={`col-span-3 text-xs ${
                  coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {coin.price_change_percentage_24h ? `${coin.price_change_percentage_24h.toFixed(2)}%` : "0.00%"}
              </div>
              <div className="col-span-3 text-sm font-semibold">${formatPrice(coin.current_price)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => JSON.stringify(prevProps.topMovers) === JSON.stringify(nextProps.topMovers)
);


const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
