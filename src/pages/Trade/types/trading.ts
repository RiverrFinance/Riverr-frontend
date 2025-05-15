export interface OrderData {
  type: "Long" | "Short" | "Swap";
  payAmount: number;
  payToken: string;
  receiveAmount: number;
  receiveToken: string;
  leverage: number;
  slippage?: number;
}

export type InputError =
  | "Insufficient Balance"
  | "Smaller than min collateral"
  | "Limit Price is required"
  | null;
