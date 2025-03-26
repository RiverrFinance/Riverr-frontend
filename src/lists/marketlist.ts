export interface Market {
  baseAsset: Asset;
  quoteAsset: Asset;
  market_id?: string;
  chartId: string;
  isFavorite?: boolean;
}

export interface Asset {
  priceID: string;
  name: string;
  symbol: string;
  image?: string;
  vaultID?: string;
  canisterID: string;
  decimals: number;
}

export const assetList: Asset[] = [
  {
    priceID: "internet-computer",
    symbol: "ICP",
    name: "internt computer coin",
    vaultID: "5se5w-zaaaa-aaaaf-qanmq-cai",
    canisterID: "4yl7m-3qaaa-aaaaf-qanlq-cai",
    decimals: 8,
  },
  {
    priceID: "tether",
    symbol: "USDT",
    name: "usdt",
    decimals: 6,
    canisterID: "cngnf-vqaaa-aaaar-qag4q-cai",
  },
  {
    priceID: "bitcoin",
    symbol: "BTC",
    name: "bitcoin",
    decimals: 6,
    canisterID: "mxzaz-hqaaa-aaaar-qaada-cai",
  },
  {
    priceID: "ethereum",
    symbol: "ETH",
    name: "ethereum",
    decimals: 18,
    canisterID: "ss2fx-dyaaa-aaaar-qacoq-cai",
  },
];
export const quoteCurrencies: Array<Asset> = [assetList[0], assetList[1]];

export const markets: Array<Market> = [
  {
    baseAsset: assetList[2],
    quoteAsset: quoteCurrencies[0],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    market_id: "",
    isFavorite: true,
  },
  {
    baseAsset: assetList[3],
    quoteAsset: quoteCurrencies[0],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    isFavorite: true,
  },
  {
    baseAsset: assetList[2],
    quoteAsset: quoteCurrencies[1],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    isFavorite: true,
  },
  {
    baseAsset: assetList[3],
    quoteAsset: quoteCurrencies[1],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    isFavorite: true,
  },
];
