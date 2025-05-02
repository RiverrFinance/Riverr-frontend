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
  vTokenCanisterID?: string;
  canisterID: string;
  decimals: number;
  logoUrl: string;
}

export const assetList: Asset[] = [
  {
    priceID: "internet-computer",
    symbol: "ICP",
    name: "internet computer coin",
    vaultID: "5se5w-zaaaa-aaaaf-qanmq-cai",
    canisterID: "4yl7m-3qaaa-aaaaf-qanlq-cai",
    decimals: 8,
    logoUrl:
      "https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png?1696514180",
  },
  {
    priceID: "tether",
    symbol: "USDT",
    name: "usdt",
    vaultID: undefined,
    decimals: 6,
    canisterID: "cngnf-vqaaa-aaaar-qag4q-cai",
    logoUrl:
      "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1668148630",
  },
  {
    priceID: "bitcoin",
    symbol: "BTC",
    name: "bitcoin",
    vaultID: undefined,
    decimals: 6,
    canisterID: "mxzaz-hqaaa-aaaar-qaada-cai",
    logoUrl:
      "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1696501408",
  },
  {
    priceID: "ethereum",
    symbol: "ETH",
    name: "ethereum",
    vaultID: undefined,
    decimals: 18,
    canisterID: "ss2fx-dyaaa-aaaar-qacoq-cai",
    logoUrl:
      "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
];
export const quoteCurrencies: Array<Asset> = [assetList[0], assetList[1]];

export const markets: Array<Market> = [
  {
    baseAsset: assetList[2],
    quoteAsset: quoteCurrencies[0],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    market_id: "i4w3l-hiaaa-aaaaf-qao5a-cai",
    isFavorite: false,
  },
  {
    baseAsset: assetList[3],
    quoteAsset: quoteCurrencies[0],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    market_id: undefined,
    isFavorite: false,
  },
  {
    baseAsset: assetList[2],
    quoteAsset: quoteCurrencies[1],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    market_id: undefined,
    isFavorite: false,
  },
  {
    baseAsset: assetList[3],
    quoteAsset: quoteCurrencies[1],
    market_id: undefined,
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    isFavorite: false,
  },
];
