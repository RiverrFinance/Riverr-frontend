export interface OrderData {
  type: 'Long' | 'Short' | 'Swap';
  payAmount: number;
  payToken: string;
  receiveAmount: number;
  receiveToken: string;
  leverage: number;
  slippage?: number;
}

export interface TradingPanelProps {
  maxLeverage?: number;
  defaultLeverage?: number;
  onOrderSubmit?: (orderData: OrderData) => void;
  availableBalance?: number;
  supportedTokens?: string[];
  defaultToken?: string;
}

export interface ConnectWalletButtonProps {
  className?: string;
} 

export interface SidebarProps {
  children: React.ReactNode;
}
export interface CurrencyPair {
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

export interface CurrencyPairSelectorProps {
  onPairSelect?: (pair: CurrencyPair | null) => void;
  selectedQuoteCurrency: string;
}