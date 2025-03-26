export const idlFactory = ({ IDL }) => {
  const AssetType = IDL.Variant({ 'ICP' : IDL.Null, 'ICRC' : IDL.Null });
  const Asset = IDL.Record({
    'asset_type' : AssetType,
    'ledger_id' : IDL.Principal,
  });
  const VaultDetails = IDL.Record({
    'asset' : Asset,
    'min_amount' : IDL.Nat,
    'virtual_asset' : Asset,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const StakeSpan = IDL.Variant({
    'Year' : IDL.Null,
    'Instant' : IDL.Null,
    'Month2' : IDL.Null,
    'Month6' : IDL.Null,
  });
  const StakeDetails = IDL.Record({
    'stake_span' : StakeSpan,
    'expiry_time' : IDL.Nat64,
    'pre_earnings' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const StakeDurationDetails = IDL.Record({
    'total_locked' : IDL.Nat,
    'lifetime_earnings_per_token' : IDL.Nat,
  });
  const VaultStakingDetails = IDL.Record({
    'free_liquidity' : IDL.Nat,
    'span12_details' : StakeDurationDetails,
    'debt' : IDL.Nat,
    'span2_details' : StakeDurationDetails,
    'lifetime_fees' : IDL.Nat,
    'span6_details' : StakeDurationDetails,
    'span0_details' : StakeDurationDetails,
  });
  const ManageDebtParams = IDL.Record({
    'initial_debt' : IDL.Nat,
    'amount_repaid' : IDL.Nat,
    'net_debt' : IDL.Nat,
  });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  return IDL.Service({
    'approveMarket' : IDL.Func([IDL.Principal], [Result], []),
    'createPositionValidityCheck' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [IDL.Bool, IDL.Nat32],
        [],
      ),
    'fundAccount' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Vec(IDL.Nat8)), IDL.Principal],
        [Result_1],
        [],
      ),
    'getUserMarginBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserStakes' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, StakeDetails))],
        ['query'],
      ),
    'getVaultDetails' : IDL.Func([], [VaultDetails], ['query']),
    'getVaultStakingDetails' : IDL.Func([], [VaultStakingDetails], ['query']),
    'managePositionUpdate' : IDL.Func(
        [IDL.Principal, IDL.Nat, ManageDebtParams],
        [],
        [],
      ),
    'provideLeverage' : IDL.Func([IDL.Nat], [Result_2], []),
    'removeLeverage' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Vec(IDL.Nat8))],
        [Result_2],
        [],
      ),
    'stakeVirtualTokens' : IDL.Func(
        [IDL.Nat, StakeSpan, IDL.Opt(IDL.Vec(IDL.Nat8))],
        [Result_3],
        [],
      ),
    'unStakeVirtualTokens' : IDL.Func([IDL.Nat64], [Result_3], []),
    'withdrawFromAccount' : IDL.Func([IDL.Nat, Account], [Result_3], []),
  });
};
export const init = ({ IDL }) => {
  const AssetType = IDL.Variant({ 'ICP' : IDL.Null, 'ICRC' : IDL.Null });
  const Asset = IDL.Record({
    'asset_type' : AssetType,
    'ledger_id' : IDL.Principal,
  });
  const VaultDetails = IDL.Record({
    'asset' : Asset,
    'min_amount' : IDL.Nat,
    'virtual_asset' : Asset,
  });
  return [VaultDetails];
};
