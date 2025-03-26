import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Asset, assetList, quoteCurrencies } from "../../lists/marketlist";
import { HttpAgent } from "@dfinity/agent";
import { AssetComponent } from "./AssetComponent";
import { useAgent } from "@nfid/identitykit/react";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { fetchDetails } from "../../utils/utilFunction";
import { formatUnits } from "ethers/lib/utils";

const ICP_API_HOST = "https://icp-api.io/";

interface PriceDetails {
  price: number;
  price_change_24h: number;
}

export function Dashboard() {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [pricesArray, setPricesArray] = useState<number[]>([]);
  const [balancesArray, setBalancesArray] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);

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
    <div>
      <div>{formatPrice(totalValue)}USD</div>
      <AssetListComponent
        pricesArray={pricesArray}
        balancesArray={balancesArray}
      />
    </div>
  );
}

interface AssetListsProps {
  pricesArray: number[];
  balancesArray: string[];
}
const AssetListComponent = memo(
  function Component({ pricesArray, balancesArray }: AssetListsProps) {
    return (
      <div>
        {assetList.map((asset, index) => {
          const price = pricesArray[index] || 0;
          const userBalance = balancesArray[index] || "0.00";

          return (
            <div key={asset.name}>
              <AssetComponent
                asset={asset}
                price={price}
                userBalance={userBalance}
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

const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
