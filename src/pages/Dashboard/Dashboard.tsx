import { memo, useCallback, useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { AssetComponent } from "./AssetComponent";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { fetchDetails, fetchTopMovers } from "../../utils/utilFunction";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import FundingPopUp from "./FundingPopUp";
import WithdrawPopUp from "./WIthdrawPopUp";
import { Icon } from "semantic-ui-react";
import { MinterActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";

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
  const { user } = useAuth();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [pricesArray, setPricesArray] = useState<number[]>([]);
  const [balancesArray, setBalancesArray] = useState<bigint[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [topMovers, setTopMovers] = useState<CoinGeckoMarketData[]>([]);
  const topPriorityCoinIds =
    "bitcoin,ethereum,binancecoin,aave,solana,ripple,internet-computer,usd-coin";

  const [showBalances, setShowBalances] = useState(true);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);

  useEffect(() => {
    if (readWriteAgent) {
      changeTotalValue();
    } else {
      setTotalValue(0);
      setBalancesArray([]);
    }
  }, [readWriteAgent, balancesArray.toString(), JSON.stringify(pricesArray)]);

  useEffect(() => {
    updateValueDetails();
    const interval = setInterval(() => {
      updateValueDetails();
    }, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  useEffect(() => {
    fetchAndSetTopMovers();
    const interval = setInterval(fetchAndSetTopMovers, 15000); // Fetch every 15s (three '0' added)
    return () => clearInterval(interval);
  }, []);

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

  /// Canister Interaction fucntions

  const fetchAndSetTopMovers = async () => {
    try {
      const response = await fetchTopMovers(topPriorityCoinIds);
      if (response.ok) {
        const combinedTopMovers = await response.json();
        console.log(combinedTopMovers);
        setTopMovers(combinedTopMovers);
      }
    } catch (err) {
      // console.log(`this error occured in dahsboard ${err}`);
    }
  };

  const fetcherUserMarginBalance = async (asset: Asset): Promise<bigint> => {
    if (asset.vaultID && readWriteAgent) {
      let vaultActor = new VaultActor(asset.vaultID, readAgent);
      const balance = await vaultActor.userMarginBalance(user.principal);
      return balance;
    }
    return 0n;
  };

  const fetchAssetPrice = async (asset: Asset): Promise<number> => {
    let response = await fetchDetails(asset.priceID);
    let assetValueDetails: PriceDetails = await response.json();
    let { price } = assetValueDetails;

    return price;
  };

  const getUserAssetValue = async (asset: Asset): Promise<[number, bigint]> => {
    let price = await fetchAssetPrice(asset);
    let userMargin = await fetcherUserMarginBalance(asset);
    return [price, userMargin]; //formatUnits(userMargin, asset.decimals)];
  };

  const updateValueDetails = async () => {
    try {
      let sendPromiseList: Promise<[number, bigint]>[] = assetList.map(
        (asset) => getUserAssetValue(asset)
      );
      let resolvedPromiseList: [number, bigint][] = await Promise.all(
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
      let refAsset = assetList[index];
      let currentValue = (price * Number(balance)) / 10 ** refAsset.decimals;
      valueSum += currentValue;
    });
    setTotalValue(valueSum);
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
          10n ** BigInt(asset.decimals + 1) // ICP tokens
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
        <div className="py-5 px-5 h-fit bg-[#18191D] rounded-2xl md:rounded-3xl">
          <div className="bg-[#0300AD] rounded-lg md:rounded-2xl py-10 md:px-5 px-12 h-fit flex justify-between items-center">
            <div className="flex flex-col max-xs:items-center">
              <div className="text-3xl font-black tracking-wide mb-4">
                Dashboard
              </div>
              <div className="space-y-1 flex flex-col max-xs:items-center">
                <div className="text-md text-gray-300">Total Balance</div>
                <div className="text-2xl font-bold space-x-2 transition-all">
                  <span>
                    {showBalances ? `$${format(totalValue)}` : "**********"}
                  </span>
                  <button
                    type="button"
                    title="eye"
                    onClick={onShowBalances}
                    className="cursor-pointer text-gray-300 hover:text-white focus:outline-none"
                  >
                    <Icon
                      name={showBalances ? "eye" : "eye slash"}
                      size="tiny"
                    />
                  </button>
                  <small className="uppercase text-xs">USD</small>
                </div>

                <div className="text-sm text-gray-400">
                  {/* {showBalances ? "100 icp" : "****"} */}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                className={`bg-white hover:bg-gray-100 text-[#0300AD] text-sm font-medium px-4 py-2 rounded-full flex gap-1 transition-all duration-300 hover:-translate-y-0.5 border border-black hover:border-t hover:border-b hover:shadow-[0_4px_0_0_#000000] ${
                  !readWriteAgent || isClaimingFaucet
                    ? "opacity-75 cursor-not-allowed bg-gray-200"
                    : ""
                }`}
                onClick={receiveFaucet}
                disabled={!readWriteAgent || isClaimingFaucet}
              >
                <Icon
                  name={isClaimingFaucet ? "spinner" : "tint"}
                  loading={isClaimingFaucet}
                />
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
                  Connect wallet to claim faucet
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-grow py-8 px-5 bg-[#18191D] rounded-2xl md:rounded-3xl h-screen">
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
      <div className="lg:col-span-4 md:col-span-5 py-7 h-full bg-[#18191D] rounded-2xl md:rounded-3xl">
        <div className="capitalize flex px-7">
          <h2 className="text-2xl">top movers</h2>
        </div>
        <TopMoversComponent topMovers={topMovers} />
      </div>

      {selectedAsset && (
        <>
          <FundingPopUp
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
              ] || 0n
            }
          />
        </>
      )}
    </div>
  );
}

interface AssetListsProps {
  pricesArray: number[];
  balancesArray: bigint[];
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
            const userBalance = balancesArray[index] || 0n; // asset.vaultid

            return (
              <div
                key={asset.name}
                className="hover:px-4 p-2 hover:border border-[#27272b]  hover:border-[#27272b] rounded-2xl transition-all duration-300"
              >
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
      prevProps.balancesArray.toString() == newProps.balancesArray.toString()
    );
  }
);

interface TopMoversProps {
  topMovers: CoinGeckoMarketData[];
}

const TopMoversComponent = memo(
  ({ topMovers }: TopMoversProps) => {
    return (
      <div className="mt-5 p-5 max-h-screen h-full overflow-y-scroll overflow-x-hidden">
        <div className="flex flex-col gap-3">
          {topMovers.map((coin) => (
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
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.topMovers) === JSON.stringify(nextProps.topMovers)
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
