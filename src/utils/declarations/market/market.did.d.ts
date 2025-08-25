import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Asset { 'class' : AssetClass, 'symbol' : string }
export type AssetClass = { 'Cryptocurrency' : null } |
  { 'FiatCurrency' : null };
export interface LimitOrder {
  'buy' : boolean,
  'init_lower_bound' : bigint,
  'init_removed_liquidity' : bigint,
  'init_tick_timestamp' : bigint,
  'order_size' : bigint,
  'ref_tick' : bigint,
}
export interface MarketDetails {
  'vault_id' : Principal,
  'quote_asset' : Asset,
  'base_asset' : Asset,
  'xrc_id' : Principal,
  'tick_spacing' : bigint,
}
export type PositionOrderType = { 'Limit' : LimitOrder } |
  { 'Market' : null };
export interface PositionParameters {
  'owner' : Principal,
  'debt_value' : bigint,
  'long' : boolean,
  'entry_tick' : bigint,
  'order_type' : PositionOrderType,
  'timestamp' : bigint,
  'interest_rate' : number,
  'collateral_value' : bigint,
  'volume_share' : bigint,
}
export type PositionStatus = { 'FILLED' : null } |
  { 'PARTIAL' : null } |
  { 'UNFILLED' : null };
export type Result = { 'Ok' : PositionParameters } |
  { 'Err' : string };
export interface StateDetails {
  'max_leveragex10' : number,
  'not_paused' : boolean,
  'min_collateral' : bigint,
}
export interface _SERVICE {
  'closeLimitPosition' : ActorMethod<[number], bigint>,
  'closeMarketPosition' : ActorMethod<[number, [] | [bigint]], bigint>,
  'getAccountPositionDetails' : ActorMethod<
    [Principal, number],
    [] | [[PositionParameters, PositionStatus, bigint]]
  >,
  'getBestOffers' : ActorMethod<[], [bigint, bigint]>,
  'getMarketDetails' : ActorMethod<[], MarketDetails>,
  'getStateDetails' : ActorMethod<[], StateDetails>,
  'liquidatePosition' : ActorMethod<[Principal, number], boolean>,
  'openLimitPosition' : ActorMethod<
    [number, boolean, bigint, number, bigint],
    Result
  >,
  'openMarketPosition' : ActorMethod<
    [number, boolean, bigint, number, [] | [bigint]],
    Result
  >,
  'retryAccountError' : ActorMethod<[Uint8Array | number[]], undefined>,
  'startTimer' : ActorMethod<[], undefined>,
  'successNotification' : ActorMethod<
    [Uint8Array | number[], bigint],
    undefined
  >,
  'updateStateDetails' : ActorMethod<[StateDetails], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
