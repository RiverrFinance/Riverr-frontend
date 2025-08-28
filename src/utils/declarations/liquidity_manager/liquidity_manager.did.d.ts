import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Asset { 'asset_type' : AssetType, 'ledger_id' : Principal }
export type AssetType = { 'ICP' : null } |
  { 'ICRC' : null };
export interface LiquidityManagerDetails {
  'asset' : Asset,
  'min_amount' : bigint,
  'virtual_asset' : Asset,
}
export interface LockDetails {
  'stake_span' : LockSpan,
  'expiry_time' : bigint,
  'pre_earnings' : bigint,
  'amount' : bigint,
}
export interface LockDurationDetails {
  'total_locked' : bigint,
  'lifetime_earnings_per_token' : bigint,
}
export type LockSpan = { 'Year' : null } |
  { 'Instant' : null } |
  { 'Month2' : null } |
  { 'Month6' : null };
export interface ManageDebtParams {
  'initial_debt' : bigint,
  'amount_repaid' : bigint,
  'net_debt' : bigint,
}
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : boolean } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface Vault {
  'free_liquidity' : bigint,
  'span12_details' : LockDurationDetails,
  'debt' : bigint,
  'span2_details' : LockDurationDetails,
  'lifetime_fees' : bigint,
  'span6_details' : LockDurationDetails,
  'span0_details' : LockDurationDetails,
}
export interface _SERVICE {
  'approveMarket' : ActorMethod<[Principal], Result>,
  'collectFromVault' : ActorMethod<
    [bigint, [] | [Uint8Array | number[]]],
    Result_1
  >,
  'fundAccount' : ActorMethod<
    [bigint, [] | [Uint8Array | number[]], Principal],
    Result_2
  >,
  'getLiquidityManagerDetails' : ActorMethod<[], LiquidityManagerDetails>,
  'getUserLocks' : ActorMethod<
    [Principal],
    Array<[bigint, LockDetails, bigint]>
  >,
  'getUserMarginBalance' : ActorMethod<[Principal], bigint>,
  'getVault' : ActorMethod<[], Vault>,
  'lendToVault' : ActorMethod<[bigint], Result_1>,
  'liquidityChangeValidityCheck' : ActorMethod<
    [Principal, bigint, bigint],
    [boolean, number]
  >,
  'lockQTokens' : ActorMethod<
    [bigint, LockSpan, [] | [Uint8Array | number[]]],
    Result_3
  >,
  'managePositionUpdate' : ActorMethod<
    [Principal, bigint, ManageDebtParams],
    undefined
  >,
  'unlockQTokens' : ActorMethod<[bigint], Result_3>,
  'withdrawFromAccount' : ActorMethod<[bigint, Account], Result_3>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
