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