export interface Market {
  baseAsset: Asset;
  quoteAsset: Asset;
  market_id?: string;
  chartId: string;
  isFavorite?: boolean;
}

export interface Asset {
  priceID: number | string;
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
    priceID: "ICP",
    symbol: "ICP",
    name: "Internet Computer",
    vaultID: "5se5w-zaaaa-aaaaf-qanmq-cai",
    canisterID: "4yl7m-3qaaa-aaaaf-qanlq-cai",
    vTokenCanisterID: "53hwk-piaaa-aaaaf-qanna-cai",
    decimals: 8,
    logoUrl:
      "https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png?1696514180",
  },
  {
    priceID: "USDT",
    symbol: "USDT",
    name: "Tether",
    vaultID: undefined,
    decimals: 6,
    canisterID: "lpgic-cqaaa-aaaaf-qbtiq-cai",
    logoUrl:
      "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1668148630",
  },
  {
    priceID: "BTC",
    symbol: "BTC",
    name: "bitcoin",
    vaultID: undefined,
    decimals: 6,
    canisterID: "mxzaz-hqaaa-aaaar-qaada-cai",
    logoUrl:
      "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1696501408",
  },
  {
    priceID: "ETH",
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
    market_id: "lgfd6-uyaaa-aaaaf-qbtja-cai",
    isFavorite: false,
  },
  {
    baseAsset: assetList[3],
    quoteAsset: quoteCurrencies[0],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    isFavorite: false,
  },
  {
    baseAsset: assetList[2],
    quoteAsset: quoteCurrencies[1],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    isFavorite: false,
  },
  {
    baseAsset: assetList[3],
    quoteAsset: quoteCurrencies[1],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    isFavorite: false,
  },
];
