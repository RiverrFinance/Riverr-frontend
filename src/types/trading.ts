import { Agent, Identity } from "@dfinity/agent";
import { MarketActor } from "../utils/Interfaces/marketActor";
export interface OrderData {
  type: "Long" | "Short" | "Swap";
  payAmount: number;
  payToken: string;
  receiveAmount: number;
  receiveToken: string;
  leverage: number;
  slippage?: number;
}

export interface TradingPanelProps {
  market: Market;
  identity: Identity | null;

  onOrderSubmit?: () => void;
}

export interface ConnectWalletButtonProps {
  setConnected: (state: boolean) => void;
  onConnect: (Identity: Identity) => void;
}

export interface SidebarProps {
  children: React.ReactNode;
}

export interface Market {
  baseAsset: Asset;
  quoteAsset: Asset;
  market_id: string;
  chartId?: string;
  isFavorite?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  vault?: string;
}
