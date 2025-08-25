export const idlFactory = ({ IDL }) => {
  const AssetType = IDL.Variant({ 'ICP' : IDL.Null, 'ICRC' : IDL.Null });
  const Asset = IDL.Record({
    'asset_type' : AssetType,
    'ledger_id' : IDL.Principal,
  });
  const LiquidityManagerDetails = IDL.Record({
    'asset' : Asset,
    'min_amount' : IDL.Nat,
    'virtual_asset' : Asset,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const LockSpan = IDL.Variant({
    'Year' : IDL.Null,
    'Instant' : IDL.Null,
    'Month2' : IDL.Null,
    'Month6' : IDL.Null,
  });
  const LockDetails = IDL.Record({
    'stake_span' : LockSpan,
    'expiry_time' : IDL.Nat64,
    'pre_earnings' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const LockDurationDetails = IDL.Record({
    'total_locked' : IDL.Nat,
    'lifetime_earnings_per_token' : IDL.Nat,
  });
  const Vault = IDL.Record({
    'free_liquidity' : IDL.Nat,
    'span12_details' : LockDurationDetails,
    'debt' : IDL.Nat,
    'span2_details' : LockDurationDetails,
    'lifetime_fees' : IDL.Nat,
    'span6_details' : LockDurationDetails,
    'span0_details' : LockDurationDetails,
  });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const ManageDebtParams = IDL.Record({
    'initial_debt' : IDL.Nat,
    'amount_repaid' : IDL.Nat,
    'net_debt' : IDL.Nat,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  return IDL.Service({
    'approveMarket' : IDL.Func([IDL.Principal], [Result], []),
    'collectFromVault' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Vec(IDL.Nat8))],
        [Result_1],
        [],
      ),
    'fundAccount' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Vec(IDL.Nat8)), IDL.Principal],
        [Result_2],
        [],
      ),
    'getLiquidityManagerDetails' : IDL.Func(
        [],
        [LiquidityManagerDetails],
        ['query'],
      ),
    'getUserLocks' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, LockDetails, IDL.Nat))],
        ['query'],
      ),
    'getUserMarginBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getVault' : IDL.Func([], [Vault], ['query']),
    'lendToVault' : IDL.Func([IDL.Nat], [Result_1], []),
    'liquidityChangeValidityCheck' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [IDL.Bool, IDL.Nat32],
        [],
      ),
    'lockQTokens' : IDL.Func(
        [IDL.Nat, LockSpan, IDL.Opt(IDL.Vec(IDL.Nat8))],
        [Result_3],
        [],
      ),
    'managePositionUpdate' : IDL.Func(
        [IDL.Principal, IDL.Nat, ManageDebtParams],
        [],
        [],
      ),
    'unlockQTokens' : IDL.Func([IDL.Nat64], [Result_3], []),
    'withdrawFromAccount' : IDL.Func([IDL.Nat, Account], [Result_3], []),
  });
};
export const init = ({ IDL }) => {
  const AssetType = IDL.Variant({ 'ICP' : IDL.Null, 'ICRC' : IDL.Null });
  const Asset = IDL.Record({
    'asset_type' : AssetType,
    'ledger_id' : IDL.Principal,
  });
  const LiquidityManagerDetails = IDL.Record({
    'asset' : Asset,
    'min_amount' : IDL.Nat,
    'virtual_asset' : Asset,
  });
  return [LiquidityManagerDetails];
};
