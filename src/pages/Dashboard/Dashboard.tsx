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
import { GlowingEffect } from "../../components/Glowing-effect";
//import { ClearingHouse } from "../../utils/Interfaces/clearingHouse";

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

  const getUserAssetValue = async (asset: Asset): Promise<[number, string]> => {
    let price = await fetchAssetPrice(asset);
    let userMargin = await fetcherUserMarginBalance(asset);
    return [price, formatUnits(userMargin, asset.decimals)]; //formatUnits(userMargin, asset.decimals)];
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

  return (
    <div className="max-h-fit bg-transparent rounded-3xl grid md:grid-cols-12 md:gap-5 gap-10 ">
      <div className="md:space-y-6 space-y-3 lg:col-span-8 md:col-span-7 h-full overflow-hidden flex flex-col">
        <div className="py-5 max-xs:py-2 px-5 max-xs:px-2 h-fit bg-[#18191de9] rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40">
          <div className="bg-[#0300AD] rounded-lg md:rounded-2xl py-10 md:px-10 px-12  h-fit flex max-xs:flex-col max-xs:gap-8 justify-between items-start xs:items-center">
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
        <div className="flex-grow py-8 px-5 max-xs:px-3 bg-[#18191de9] rounded-2xl md:rounded-3xl h-screen border-2 border-dashed border-[#363c52] border-opacity-40">
          <div className="text-2xl font-bold mb-4 capitalize">portfolio</div>
          <div>
            <AssetListComponent
              pricesArray={pricesArray}
              balancesArray={balancesArray}
              onDeposit={onOpenDepositModal}
              onWithdraw={onOpenWithdrawModal}
            />
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 md:col-span-5 py-7 h-full bg-[#18191de9] rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40">
        <div className="capitalize flex px-7">
          <h2 className="text-2xl">top movers</h2>
        </div>
        <div className="mt-5 p-5 max-h-screen h-full overflow-y-scroll overflow-x-hidden">
          <div className="flex flex-col gap-3">
            {isLoadingTopMovers
              ? Array(26)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="py-4 grid grid-cols-12 items-center gap-3"
                    >
                      <div className="col-span-6 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52]" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-20 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                          <div className="h-3 w-12 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                        </div>
                      </div>
                      <div className="col-span-3 h-4 w-16 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                      <div className="col-span-3 h-4 w-16 animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#363c52] rounded" />
                    </div>
                  ))
              : topMovers.map((coin) => (
                  <div
                    key={coin.id}
                    className="py-4 grid grid-cols-12 items-center justify-between gap-3"
                  >
                    <div className="col-span-6 flex items-center">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 mr-2"
                      />
                      <div>
                        <div className="text-md font-semibold">{coin.name}</div>
                        <div className="text-sm text-gray-500">
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`col-span-3 text-sm ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {coin.price_change_percentage_24h
                        ? `${coin.price_change_percentage_24h.toFixed(2)}%`
                        : "0.00%"}
                    </div>
                    <div className="col-span-3 text-sm font-semibold">
                      ${format(coin.current_price)}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

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
  onDeposit: (asset: Asset) => void;
  onWithdraw: (asset: Asset) => void;
}
const AssetListComponent = memo(
  function Component({
    pricesArray,
    balancesArray,
    onDeposit,
    onWithdraw,
  }: AssetListsProps) {
    const [openAccordionIndex, setOpenAccordionIndex] = useState(0); // to toggle accordion, the index of the opened accordion
    const handleAccordionToggle = (index: number) => {
      setOpenAccordionIndex((prevIndex) => (prevIndex === index ? -1 : index));
    };

    return (
      <div className="mt-4">
        <div className="grid grid-cols-12 items-center justify-between justify-items-start py-2 text-xs text-gray-500 capitalize">
          <div className="col-span-4  max-lg:col-span-6">Asset</div>
          <div className="col-span-2 max-lg:col-span-3 text-right">Price</div>
          <div className="col-span-2  max-lg:col-span-3 text-right">
            Balance
          </div>
          <div className="col-span-4 max-lg:sr-only text-right"></div>
        </div>
        <div className="flex flex-col gap-5">
          {assetList.map((asset, index) => {
            const price = pricesArray[index]; // asset.priceID
            const userBalance = balancesArray[index] || "0"; // asset.vaultid

            return (
              <div
                key={asset.name}
                className="relative hover:px-4 p-2 hover:border border-[#27272b] hover:border-[#27272b] rounded-2xl transition-all duration-300"
              >
                <GlowingEffect
                  spread={2}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="">
                  <AssetComponent
                    asset={asset}
                    price={price}
                    userBalance={userBalance}
                    index={index}
                    openAccordionIndex={openAccordionIndex}
                    onAccordionToggle={handleAccordionToggle}
                    onDeposit={onDeposit}
                    onWithdraw={onWithdraw}
                  />
                </div>
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
        JSON.stringify(newProps.balancesArray)
    );
  }
);

// interface TopMoversProps {
//   topMovers: CoinGeckoMarketData[];
// }

// const TopMoversComponent = memo(
//   ({ topMovers }: TopMoversProps) => {
//     return (
//       <div className="mt-5 p-5 max-h-screen h-full overflow-y-scroll overflow-x-hidden">
//         <div className="flex flex-col gap-3">
//           {topMovers.map((coin) => (
//             <div
//               key={coin.id}
//               className="py-4 grid grid-cols-12 items-center justify-between gap-3"
//             >
//               <div className="col-span-6 flex items-center">
//                 <img
//                   src={coin.image}
//                   alt={coin.name}
//                   className="w-6 h-6 mr-2"
//                 />
//                 <div>
//                   <div className="text-md font-semibold">{coin.name}</div>
//                   <div className="text-sm text-gray-500">
//                     {coin.symbol.toUpperCase()}
//                   </div>
//                 </div>
//               </div>
//               <div
//                 className={`col-span-3 text-sm ${
//                   coin.price_change_percentage_24h >= 0
//                     ? "text-green-500"
//                     : "text-red-500"
//                 }`}
//               >
//                 {coin.price_change_percentage_24h
//                   ? `${coin.price_change_percentage_24h.toFixed(2)}%`
//                   : "0.00%"}
//               </div>
//               <div className="col-span-3 text-sm font-semibold">
//                 ${format(coin.current_price)}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   },
//   (prevProps, nextProps) =>
//     JSON.stringify(prevProps.topMovers) === JSON.stringify(nextProps.topMovers)
// );

const format = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
