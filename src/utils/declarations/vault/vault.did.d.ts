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
export interface ManageDebtParams {
  'initial_debt' : bigint,
  'amount_repaid' : bigint,
  'net_debt' : bigint,
}
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : boolean } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface StakeDetails {
  'stake_span' : StakeSpan,
  'expiry_time' : bigint,
  'pre_earnings' : bigint,
  'amount' : bigint,
}
export interface StakeDurationDetails {
  'total_locked' : bigint,
  'lifetime_earnings_per_token' : bigint,
}
export type StakeSpan = { 'Year' : null } |
  { 'Instant' : null } |
  { 'Month2' : null } |
  { 'Month6' : null };
export interface VaultDetails {
  'asset' : Asset,
  'min_amount' : bigint,
  'virtual_asset' : Asset,
}
export interface VaultStakingDetails {
  'free_liquidity' : bigint,
  'span12_details' : StakeDurationDetails,
  'debt' : bigint,
  'span2_details' : StakeDurationDetails,
  'lifetime_fees' : bigint,
  'span6_details' : StakeDurationDetails,
  'span0_details' : StakeDurationDetails,
}
export interface _SERVICE {
  'approveMarket' : ActorMethod<[Principal], Result>,
  'createPositionValidityCheck' : ActorMethod<
    [Principal, bigint, bigint],
    [boolean, number]
  >,
  'fundAccount' : ActorMethod<
    [bigint, [] | [Uint8Array | number[]], Principal],
    Result_1
  >,
  'getUserMarginBalance' : ActorMethod<[Principal], bigint>,
  'getUserStakes' : ActorMethod<
    [Principal],
    Array<[bigint, StakeDetails, bigint]>
  >,
  'getVaultDetails' : ActorMethod<[], VaultDetails>,
  'getVaultStakingDetails' : ActorMethod<[], VaultStakingDetails>,
  'managePositionUpdate' : ActorMethod<
    [Principal, bigint, ManageDebtParams],
    undefined
  >,
  'provideLeverage' : ActorMethod<[bigint], Result_2>,
  'removeLeverage' : ActorMethod<
    [bigint, [] | [Uint8Array | number[]]],
    Result_2
  >,
  'stakeVirtualTokens' : ActorMethod<
    [bigint, StakeSpan, [] | [Uint8Array | number[]]],
    Result_3
  >,
  'unStakeVirtualTokens' : ActorMethod<[bigint], Result_3>,
  'withdrawFromAccount' : ActorMethod<[bigint, Account], Result_3>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
