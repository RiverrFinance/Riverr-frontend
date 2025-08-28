export const idlFactory = ({ IDL }) => {
  const AssetLedgerType = IDL.Variant({ 'ICP' : IDL.Null, 'ICRC' : IDL.Null });
  const AssetLedger = IDL.Record({
    'ledger_id' : IDL.Principal,
    'ledger_type' : AssetLedgerType,
    'asset_decimals' : IDL.Nat32,
  });
  const AssetClass = IDL.Variant({
    'Cryptocurrency' : IDL.Null,
    'FiatCurrency' : IDL.Null,
  });
  const AssetPricingDetails = IDL.Record({
    'class' : AssetClass,
    'symbol' : IDL.Text,
  });
  const HouseDetails = IDL.Record({
    'house_asset_ledger' : AssetLedger,
    'house_asset_pricing_details' : AssetPricingDetails,
    'execution_fee' : IDL.Nat,
  });
  const AddLiquidityToMarketParams = IDL.Record({
    'min_amount_out' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const LiquidityOperationResult = IDL.Variant({
    'Failed' : IDL.Null,
    'Waiting' : IDL.Null,
    'Settled' : IDL.Record({ 'amount_out' : IDL.Nat }),
  });
  const MarketState = IDL.Record({
    'liquidation_factor' : IDL.Nat,
    'max_leverage_factor' : IDL.Nat,
    'max_reserve_factor' : IDL.Nat,
  });
  const CreateMarketParams = IDL.Record({
    'shorts_borrowing_exponent_factor' : IDL.Nat,
    'longs_base_borrowing_factor' : IDL.Nat,
    'init_state' : MarketState,
    'funding_exponent_factor' : IDL.Nat,
    'longs_borrowing_exponent_factor' : IDL.Nat,
    'shorts_base_borrowing_factor' : IDL.Nat,
    'asset_pricing_details' : AssetPricingDetails,
    'shorts_max_reserve_factor' : IDL.Nat,
    'funding_factor' : IDL.Nat,
    'longs_max_reserve_factor' : IDL.Nat,
  });
  const ClosePositionParams = IDL.Record({
    'acceptable_price_limit' : IDL.Nat,
    'position_id' : IDL.Nat64,
  });
  const ClosePositionResult = IDL.Variant({
    'Failed' : IDL.Null,
    'Waiting' : IDL.Null,
    'Settled' : IDL.Record({ 'returns' : IDL.Nat }),
  });
  const DepositParams = IDL.Record({
    'block_index' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const BiasDetails = IDL.Record({
    'total_open_interest_dynamic' : IDL.Int,
    'total_open_interest' : IDL.Nat,
    'current_borrowing_factor' : IDL.Nat,
    'total_units' : IDL.Nat,
    'cummulative_borrowing_factor_since_epoch' : IDL.Nat,
    'borrowing_exponent_factor_' : IDL.Nat,
    'cummulative_funding_factor_since_epoch' : IDL.Int,
    'base_borrowing_factor' : IDL.Nat,
    'total_debt_of_traders' : IDL.Nat,
    'total_reserve' : IDL.Nat,
  });
  const Bias = IDL.Record({ 'shorts' : BiasDetails, 'longs' : BiasDetails });
  const PricingManager = IDL.Record({
    'negative_price_impact_factor' : IDL.Nat,
    'price_impact_exponent_factor' : IDL.Nat,
    'positive_price_impact_factor' : IDL.Nat,
    'price' : IDL.Nat,
  });
  const FundingManager = IDL.Record({
    'threshold_stable_funding' : IDL.Nat,
    'last_time_updated' : IDL.Nat64,
    'funding_increase_factor_ps' : IDL.Nat,
    'funding_exponent_factor' : IDL.Nat,
    'funding_decrease_factor_ps' : IDL.Nat,
    'next_funding_factor_ps' : IDL.Int,
    'threshold_decrease_funding' : IDL.Nat,
    'max_funding_factor_ps' : IDL.Nat,
    'min_funding_factor_ps' : IDL.Nat,
    'funding_factor' : IDL.Nat,
  });
  const HouseLiquidityManager = IDL.Record({
    'free_liquidity' : IDL.Nat,
    'liquidation_factor' : IDL.Nat,
    'current_shorts_reserve' : IDL.Nat,
    'total_liquidity_tokens_minted' : IDL.Nat,
    'current_longs_reserve' : IDL.Nat,
    'last_time_since_borrow_fees_collected' : IDL.Nat64,
    'current_borrow_fees_owed' : IDL.Nat,
    'bad_debt' : IDL.Nat,
    'shorts_max_reserve_factor' : IDL.Nat,
    'longs_max_reserve_factor' : IDL.Nat,
    'current_net_debt' : IDL.Nat,
    'total_deposit' : IDL.Nat,
  });
  const MarketDetails = IDL.Record({
    'bias_tracker' : Bias,
    'state' : MarketState,
    'pricing_manager' : PricingManager,
    'funding_manager' : FundingManager,
    'index_asset_pricing_details' : AssetPricingDetails,
    'liquidity_manager' : HouseLiquidityManager,
  });
  const OpenPositionParams = IDL.Record({
    'acceptable_price_limit' : IDL.Nat,
    'owner' : IDL.Principal,
    'long' : IDL.Bool,
    'collateral' : IDL.Nat,
    'reserve_factor' : IDL.Nat,
    'market_index' : IDL.Nat64,
    'leverage_factor' : IDL.Nat,
  });
  const FailureReason = IDL.Variant({
    'PriceLimitExceeded' : IDL.Null,
    'InsufficientBalance' : IDL.Null,
    'Other' : IDL.Null,
  });
  const PositionDetails = IDL.Record({
    'pre_cummulative_funding_factor' : IDL.Int,
    'max_reserve' : IDL.Nat,
    'owner' : IDL.Principal,
    'debt' : IDL.Nat,
    'long' : IDL.Bool,
    'collateral' : IDL.Nat,
    'pre_cummulative_borrowing_factor' : IDL.Nat,
    'units' : IDL.Nat,
  });
  const OpenPositioninMarketResult = IDL.Variant({
    'Failed' : IDL.Record({ 'reason' : FailureReason }),
    'Waiting' : IDL.Record({ 'params' : OpenPositionParams }),
    'Settled' : IDL.Record({ 'position' : PositionDetails }),
  });
  const RemoveLiquidityFromMarketParams = IDL.Record({
    'min_amount_out' : IDL.Nat,
    'amount_in' : IDL.Nat,
  });
  const WithdrawParams = IDL.Record({ 'amount' : IDL.Nat });
  return IDL.Service({
    'addLiquidity' : IDL.Func(
        [IDL.Nat64, AddLiquidityToMarketParams],
        [LiquidityOperationResult],
        [],
      ),
    'add_market' : IDL.Func(
        [CreateMarketParams, AssetPricingDetails, MarketState],
        [],
        [],
      ),
    'closePosition' : IDL.Func(
        [ClosePositionParams],
        [ClosePositionResult],
        [],
      ),
    'deposit' : IDL.Func([DepositParams], [IDL.Bool], []),
    'getUserBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserMarketLiquidityShares' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [IDL.Nat],
        ['query'],
      ),
    'get_market_details' : IDL.Func([IDL.Nat64], [MarketDetails], ['query']),
    'get_markets_count' : IDL.Func([], [IDL.Nat64], ['query']),
    'openPosition' : IDL.Func(
        [OpenPositionParams],
        [OpenPositioninMarketResult],
        [],
      ),
    'removeLiquidity' : IDL.Func(
        [IDL.Nat64, RemoveLiquidityFromMarketParams],
        [LiquidityOperationResult],
        [],
      ),
    'setAdmin' : IDL.Func([IDL.Principal], [], []),
    'withdraw' : IDL.Func([WithdrawParams], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => {
  const AssetLedgerType = IDL.Variant({ 'ICP' : IDL.Null, 'ICRC' : IDL.Null });
  const AssetLedger = IDL.Record({
    'ledger_id' : IDL.Principal,
    'ledger_type' : AssetLedgerType,
    'asset_decimals' : IDL.Nat32,
  });
  const AssetClass = IDL.Variant({
    'Cryptocurrency' : IDL.Null,
    'FiatCurrency' : IDL.Null,
  });
  const AssetPricingDetails = IDL.Record({
    'class' : AssetClass,
    'symbol' : IDL.Text,
  });
  const HouseDetails = IDL.Record({
    'house_asset_ledger' : AssetLedger,
    'house_asset_pricing_details' : AssetPricingDetails,
    'execution_fee' : IDL.Nat,
  });
  return [HouseDetails];
};
