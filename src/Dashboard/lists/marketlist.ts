import { Market, Asset } from "../../types/trading";

export const quoteCurrencies: Array<Asset> = [
  {
    id: "tether",
    symbol: "USDT",
    name: "usdt",
  },
  { id: "internet-computer", symbol: "ICP", name: "icp" },
];

export const markets: Array<Market> = [
  {
    baseAsset: {
      id: "bitcoin",
      symbol: "BTC",
      name: "bitcoin",
    },
    quoteAsset: quoteCurrencies[0],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    market_id: "",
    isFavorite: true,
  },
  {
    baseAsset: {
      id: "ethereum",
      symbol: "ETH",
      name: "bitcoin",
    },
    quoteAsset: quoteCurrencies[0],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    market_id: "",
    isFavorite: true,
  },
  {
    baseAsset: {
      id: "bitcoin",
      symbol: "BTC",
      name: "bitcoin",
    },
    quoteAsset: quoteCurrencies[1],
    chartId: "xmiu5-jqaaa-aaaag-qbz7q-cai",
    market_id: "",
    isFavorite: true,
  },
  {
    baseAsset: {
      id: "ethereum",
      symbol: "ETH",
      name: "bitcoin",
    },
    market_id: "",
    quoteAsset: quoteCurrencies[1],
    chartId: "angxa-baaaa-aaaag-qcvnq-cai",
    isFavorite: true,
  },
];
