import React, { memo, useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { useAgent } from "@nfid/identitykit/react";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { HttpAgent } from "@dfinity/agent";

const ICP_API_HOST = "https://icp-api.io/";

interface Props {
  price: number;
  asset: Asset;
  userBalance: string;
}

export const AssetComponent = memo(function AssetComponent({
  asset,
  price,
  userBalance,
}: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);
  return <div>the price is {formatPrice(price)} the userBalance</div>;
});

const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
