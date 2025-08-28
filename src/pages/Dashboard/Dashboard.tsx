import { memo, useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { AssetComponent } from "./AssetComponent";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import { LiquidityManagerActor } from "../../utils/Interfaces/liquidityManagerActor";
import { fetchDetails, fetchTopMovers } from "../../utils/utilFunction";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import FundingPopUp from "./FundingPopUp";
import WithdrawPopUp from "./WIthdrawPopUp";
import { MinterActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { Eye, EyeOff, Droplets, Loader } from "lucide-react";
import { ICP_API_HOST, SECOND } from "../../utils/constants";
import {
  GradientBackgroundBackward,
  GradientBackgroundForward,
} from "../../components/GradientBackground";
import TopMovers from "./TopMovers";
import LineChart from "../../components/LineChart";
import CryptoChart from "./CryptoChart"; 

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
  const { user } = useAuth();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [pricesArray, setPricesArray] = useState<number[]>([]);
  const [priceChange24hArray, setPriceChange24hArray] = useState<number[]>([]);
  const [balancesArray, setBalancesArray] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [topMovers, setTopMovers] = useState<CoinGeckoMarketData[]>([]);
  const topPriorityCoinIds =
    "bitcoin,ethereum,binancecoin,aave,solana,ripple,internet-computer,usd-coin";

  const [showBalances, setShowBalances] = useState(true);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);
  const [isLoadingTopMovers, setIsLoadingTopMovers] = useState(true);

  useEffect(() => {
    if (readWriteAgent) {
      changeTotalValue();
    } else {
      setTotalValue(0);
      setBalancesArray([]);
    }
  }, [
    readWriteAgent,
    JSON.stringify(balancesArray),
    JSON.stringify(pricesArray),
  ]);

  useEffect(() => {
    updateValueDetails();
    const interval = setInterval(() => {
      updateValueDetails();
    }, 10 * SECOND); // 20 seconds
    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  useEffect(() => {
    // fetchAndSetTopMovers();
    //  const interval = setInterval(fetchAndSetTopMovers, 100 * SECOND); // Fetch every 35s
    //  return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  useEffect(() => {
    setIsLoadingTopMovers(topMovers.length === 0);
  }, [topMovers]);

  ///

  const onShowBalances = () => {
    setShowBalances(!showBalances);
  };

  const onOpenDepositModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDepositModalOpen(true);
  };

  const onCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setSelectedAsset(null);
    // Update balances after deposit
    updateValueDetails();
  };

  const onOpenWithdrawModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsWithdrawModalOpen(true);
  };

  const onCloseWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setSelectedAsset(null);
    // Update balances after withdrawal
    updateValueDetails();
  };

  const getUserAssetValue = async (
    asset: Asset
  ): Promise<[number, string, number]> => {
    let price = await fetchAssetPrice(asset);
    let userMargin = await fetcherUserMarginBalance(asset);
    let priceChange24h = await fetchPriceChange24h(asset);
    return [price, formatUnits(userMargin, asset.decimals), priceChange24h]; //formatUnits(userMargin, asset.decimals)];
  };

  const updateValueDetails = async () => {
    try {
      let sendPromiseList: Promise<[number, string, number]>[] = assetList.map(
        (asset) => getUserAssetValue(asset)
      );
      let resolvedPromiseList: [number, string, number][] = await Promise.all(
        sendPromiseList
      );
      const prices = resolvedPromiseList.map(([price]) => price);
      const balances = resolvedPromiseList.map(([, balance]) => balance);
      const priceChanges24h = resolvedPromiseList.map(
        ([, , priceChange]) => priceChange
      );
      setPricesArray(prices);
      setBalancesArray(balances);
      setPriceChange24hArray(priceChanges24h);
    } catch {}
  };

  const changeTotalValue = () => {
    let valueSum = 0;
    pricesArray.forEach((price, index) => {
      let balance = balancesArray[index] || 0;
      let refAsset = assetList[index];
      let currentValue = price * Number(balance);
      valueSum += currentValue;
    });
    setTotalValue(valueSum);
  };

  const fetchAndSetTopMovers = async () => {
    try {
      const response = await fetchTopMovers(topPriorityCoinIds);
      if (response.ok) {
        const combinedTopMovers = await response.json();
        //console.log(combinedTopMovers);
        setTopMovers(combinedTopMovers);
      }
    } catch (err) {
      // console.log(`this error occured in dahsboard ${err}`);
    }
  };

  /// Canister Interaction fucntions

  const fetcherUserMarginBalance = async (asset: Asset): Promise<bigint> => {
    if (asset.vaultID && readWriteAgent) {
      let vaultActor = new LiquidityManagerActor(asset.vaultID, readAgent);
      return vaultActor.userMarginBalance(user.principal);
    }
    return 0n;
  };

  const fetchAssetPrice = async (asset: Asset): Promise<number> => {
    let response = await fetchDetails(asset.priceID);
    let assetValueDetails: PriceDetails = await response.json();
    let { price } = assetValueDetails;

    return price;
  };

  const fetchPriceChange24h = async (asset: Asset): Promise<number> => {
    let response = await fetchDetails(asset.priceID);
    let assetValueDetails: PriceDetails = await response.json();
    let { price_change_24h } = assetValueDetails;

    return price_change_24h;
  };

  const receiveFaucet = async () => {
    if (readWriteAgent) {
      setIsClaimingFaucet(true);

      const asset = assetList[0];
      let mintActor = new MinterActor(
        "lmfrn-3iaaa-aaaaf-qaova-cai",
        readWriteAgent
      );
      try {
        await mintActor.mint(
          Principal.fromText(asset.canisterID),
          user.principal,
          parseUnits("100", asset.decimals).toBigInt() // ICP tokens
        );
      } catch (error) {
        console.error("Error receiving faucet:", error);
      } finally {
        setIsClaimingFaucet(false);
      }
    }
  };

  const getPrimaryPriceChange = () => {
    return priceChange24hArray[0] || 0;
  };

  const primaryPriceChange = getPrimaryPriceChange();
  const isPositive = primaryPriceChange >= 0;

  const assetNames = assetList.map(asset => asset.name);


  return (
    <div className="max-h-fit bg-transparent rounded-3xl grid grid-cols-1 gap-6">
      {/* Total Value and Trading Component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Value Component */}
        <div className="py-5 max-xs:py-2 px-5 max-xs:px-2 h-full glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
          <GradientBackgroundForward />
          <div className="glass rounded-lg md:rounded-2xl py-10 md:px-10 px-12 h-full flex max-xs:flex-col max-xs:gap-8 justify-between items-start xs:items-center">
            <div className="flex flex-col max-xs:items-center space-y-2">
              <div className="xs:space-y-5 flex max-xs:gap-5 gap-x-3 flex-col max-xs:items-start">
                <div className="text-md text-gray-300">
                  Est. Total Value (USD)
                </div>
                <div className="text-[35px] font-bold space-x-2 transition-all">
                  <span>
                    {showBalances ? `$${format(totalValue)}` : "**********"}
                  </span>
                  <button
                    type="button"
                    title="Toggle balance visibility"
                    onClick={onShowBalances}
                    className="cursor-pointer text-gray-300 hover:text-white focus:outline-none"
                  >
                    {showBalances ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-400"></div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-items-center gap-2 w-fit overflow-hidden">
              <button
                type="button"
                className={`bg-white hover:bg-gray-100 text-[#0300AD] text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 border border-black hover:border-t hover:border-b hover:shadow-[0_4px_0_0_#000000] ${
                  !readWriteAgent || isClaimingFaucet
                    ? "opacity-75 cursor-not-allowed bg-gray-200"
                    : ""
                }`}
                onClick={receiveFaucet}
                disabled={!readWriteAgent || isClaimingFaucet}
              >
                {isClaimingFaucet ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Droplets className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {!readWriteAgent
                    ? "Claim Faucet"
                    : isClaimingFaucet
                    ? "Claiming..."
                    : "Claim Faucet"}
                </span>
              </button>
              {!readWriteAgent && (
                <span className="text-xs text-gray-300">
                  Connect wallet
                  <br className="lg:sr-only max-xs:sr-only" />
                  to claim faucet
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trading Component with Chart */}
        <div className="py-5 max-xs:py-2 px-5 max-xs:px-2 h-full glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
          <GradientBackgroundBackward />
          {/* <div className="glass rounded-lg md:rounded-2xl py-6 px-6 h-full flex flex-col"> */}
            <div className="flex flex-col space-y-3 mb-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col space-y-2">
                  <div className="text-md text-gray-300">Trading Status: <span className="text-white text-xs">ICP</span></div>
                  <div className="text-sm text-gray-400">Price: ${format(pricesArray[0] || 0)}</div>
                  {/* <div className="text-[15px] font-bold space-x-2 transition-all text-green-400">
                    <span>Active</span>
                  </div> */}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">24h Change</div>
                  <div className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{primaryPriceChange.toFixed(2)}%
                  </div>
                </div>
              </div>
              {/* <div className="text-sm text-gray-400">24h Volume: $2.4M</div> */}
            </div>

            <div className="flex-1 w-full">
              <CryptoChart 
                pricesArray={pricesArray}
                priceChange24hArray={priceChange24hArray}
                assetNames={assetNames}
              />
            </div>
          {/* </div> */}
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="py-8 px-5 max-xs:px-3 glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
        <GradientBackgroundBackward />
        <div className="text-2xl font-bold mb-6 capitalize text-white">
          Portfolio
        </div>
        <div>
          <AssetListComponent
            pricesArray={pricesArray}
            balancesArray={balancesArray}
            priceChange24hArray={priceChange24hArray}
            onDeposit={onOpenDepositModal}
            onWithdraw={onOpenWithdrawModal}
          />
        </div>
      </div>

      {/* Top Movers Section */}
      <TopMovers
        topMovers={topMovers}
        isLoadingTopMovers={isLoadingTopMovers}
      />

      {/* Modal Section */}
      {selectedAsset && (
        <>
          <FundingPopUp
            readAgent={readAgent}
            asset={selectedAsset}
            isOpen={isDepositModalOpen}
            onClose={onCloseDepositModal}
          />
          <WithdrawPopUp
            asset={selectedAsset}
            isOpen={isWithdrawModalOpen}
            onClose={onCloseWithdrawModal}
            marginBalance={
              balancesArray[
                assetList.findIndex((a) => a.name === selectedAsset.name)
              ] || "0"
            }
          />
        </>
      )}
    </div>
  );
}

interface AssetListsProps {
  pricesArray: number[];
  balancesArray: string[];
  priceChange24hArray: number[];
  onDeposit: (asset: Asset) => void;
  onWithdraw: (asset: Asset) => void;
}
const AssetListComponent = memo(
  function Component({
    pricesArray,
    balancesArray,
    priceChange24hArray,
    onDeposit,
    onWithdraw,
  }: AssetListsProps) {
    const [openAccordionIndex, setOpenAccordionIndex] = useState(0);
    const handleAccordionToggle = (index: number) => {
      setOpenAccordionIndex((prevIndex) => (prevIndex === index ? -1 : index));
    };

    return (
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assetList.map((asset, index) => {
            const price = pricesArray[index]; // asset.priceID
            const userBalance = balancesArray[index] || "0"; // asset.vaultid

            return (
              <div key={asset.name} className="relative">
                {/* <GlowingEffect
                  spread={2}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                /> */}
                <AssetComponent
                  asset={asset}
                  price={price}
                  userBalance={userBalance}
                  priceChange24h={priceChange24hArray[index] || 0}
                  index={index}
                  openAccordionIndex={openAccordionIndex}
                  onAccordionToggle={handleAccordionToggle}
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  (prevProps: AssetListsProps, newProps: AssetListsProps): boolean => {
    return (
      JSON.stringify(prevProps.pricesArray) ==
        JSON.stringify(newProps.pricesArray) &&
      JSON.stringify(prevProps.balancesArray) ==
        JSON.stringify(newProps.balancesArray) &&
      JSON.stringify(prevProps.priceChange24hArray) ==
        JSON.stringify(newProps.priceChange24hArray)
    );
  }
);

const format = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};