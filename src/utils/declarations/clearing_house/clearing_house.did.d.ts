import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AddLiquidityToMarketParams {
  'min_amount_out' : bigint,
  'amount' : bigint,
}
export type AssetClass = { 'Cryptocurrency' : null } |
  { 'FiatCurrency' : null };
export interface AssetLedger {
  'ledger_id' : Principal,
  'ledger_type' : AssetLedgerType,
  'asset_decimals' : number,
}
export type AssetLedgerType = { 'ICP' : null } |
  { 'ICRC' : null };
export interface AssetPricingDetails { 'class' : AssetClass, 'symbol' : string }
export interface Bias { 'shorts' : BiasDetails, 'longs' : BiasDetails }
export interface BiasDetails {
  'total_open_interest_dynamic' : bigint,
  'total_open_interest' : bigint,
  'current_borrowing_factor' : bigint,
  'total_units' : bigint,
  'cummulative_borrowing_factor_since_epoch' : bigint,
  'borrowing_exponent_factor_' : bigint,
  'cummulative_funding_factor_since_epoch' : bigint,
  'base_borrowing_factor' : bigint,
  'total_debt_of_traders' : bigint,
  'total_reserve' : bigint,
}
export interface ClosePositionParams {
  'acceptable_price_limit' : bigint,
  'position_id' : bigint,
}
export type ClosePositionResult = { 'Failed' : null } |
  { 'Waiting' : null } |
  { 'Settled' : { 'returns' : bigint } };
export interface CreateMarketParams {
  'shorts_borrowing_exponent_factor' : bigint,
  'longs_base_borrowing_factor' : bigint,
  'init_state' : MarketState,
  'funding_exponent_factor' : bigint,
  'longs_borrowing_exponent_factor' : bigint,
  'shorts_base_borrowing_factor' : bigint,
  'asset_pricing_details' : AssetPricingDetails,
  'shorts_max_reserve_factor' : bigint,
  'funding_factor' : bigint,
  'longs_max_reserve_factor' : bigint,
}
export interface DepositParams {
  'block_index' : [] | [bigint],
  'amount' : bigint,
}
export type FailureReason = { 'PriceLimitExceeded' : null } |
  { 'InsufficientBalance' : null } |
  { 'Other' : null };
export interface FundingManager {
  'threshold_stable_funding' : bigint,
  'last_time_updated' : bigint,
  'funding_increase_factor_ps' : bigint,
  'funding_exponent_factor' : bigint,
  'funding_decrease_factor_ps' : bigint,
  'next_funding_factor_ps' : bigint,
  'threshold_decrease_funding' : bigint,
  'max_funding_factor_ps' : bigint,
  'min_funding_factor_ps' : bigint,
  'funding_factor' : bigint,
}
export interface HouseDetails {
  'house_asset_ledger' : AssetLedger,
  'house_asset_pricing_details' : AssetPricingDetails,
  'execution_fee' : bigint,
}
export interface HouseLiquidityManager {
  'free_liquidity' : bigint,
  'liquidation_factor' : bigint,
  'current_shorts_reserve' : bigint,
  'total_liquidity_tokens_minted' : bigint,
  'current_longs_reserve' : bigint,
  'last_time_since_borrow_fees_collected' : bigint,
  'current_borrow_fees_owed' : bigint,
  'bad_debt' : bigint,
  'shorts_max_reserve_factor' : bigint,
  'longs_max_reserve_factor' : bigint,
  'current_net_debt' : bigint,
  'total_deposit' : bigint,
}
export type LiquidityOperationResult = { 'Failed' : null } |
  { 'Waiting' : null } |
  { 'Settled' : { 'amount_out' : bigint } };
export interface MarketDetails {
  'bias_tracker' : Bias,
  'state' : MarketState,
  'pricing_manager' : PricingManager,
  'funding_manager' : FundingManager,
  'index_asset_pricing_details' : AssetPricingDetails,
  'liquidity_manager' : HouseLiquidityManager,
}
export interface MarketState {
  'liquidation_factor' : bigint,
  'max_leverage_factor' : bigint,
  'max_reserve_factor' : bigint,
}
export interface OpenPositionParams {
  'acceptable_price_limit' : bigint,
  'owner' : Principal,
  'long' : boolean,
  'collateral' : bigint,
  'reserve_factor' : bigint,
  'market_index' : bigint,
  'leverage_factor' : bigint,
}
export type OpenPositioninMarketResult = {
    'Failed' : { 'reason' : FailureReason }
  } |
  { 'Waiting' : { 'params' : OpenPositionParams } } |
  { 'Settled' : { 'position' : PositionDetails } };
export interface PositionDetails {
  'pre_cummulative_funding_factor' : bigint,
  'max_reserve' : bigint,
  'owner' : Principal,
  'debt' : bigint,
  'long' : boolean,
  'collateral' : bigint,
  'pre_cummulative_borrowing_factor' : bigint,
  'units' : bigint,
}
export interface PricingManager {
  'negative_price_impact_factor' : bigint,
  'price_impact_exponent_factor' : bigint,
  'positive_price_impact_factor' : bigint,
  'price' : bigint,
}
export interface RemoveLiquidityFromMarketParams {
  'min_amount_out' : bigint,
  'amount_in' : bigint,
}
export interface WithdrawParams { 'amount' : bigint }
export interface _SERVICE {
  'addLiquidity' : ActorMethod<
    [bigint, AddLiquidityToMarketParams],
    LiquidityOperationResult
  >,
  'add_market' : ActorMethod<
    [CreateMarketParams, AssetPricingDetails, MarketState],
    undefined
  >,
  'closePosition' : ActorMethod<[ClosePositionParams], ClosePositionResult>,
  'deposit' : ActorMethod<[DepositParams], boolean>,
  'getUserBalance' : ActorMethod<[Principal], bigint>,
  'getUserMarketLiquidityShares' : ActorMethod<[Principal, bigint], bigint>,
  'get_market_details' : ActorMethod<[bigint], MarketDetails>,
  'get_markets_count' : ActorMethod<[], bigint>,
  'openPosition' : ActorMethod<
    [OpenPositionParams],
    OpenPositioninMarketResult
  >,
  'removeLiquidity' : ActorMethod<
    [bigint, RemoveLiquidityFromMarketParams],
    LiquidityOperationResult
  >,
  'setAdmin' : ActorMethod<[Principal], undefined>,
  'withdraw' : ActorMethod<[WithdrawParams], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
