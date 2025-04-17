export const idlFactory = ({ IDL }) => {
  const AssetClass = IDL.Variant({
    'Cryptocurrency' : IDL.Null,
    'FiatCurrency' : IDL.Null,
  });
  const Asset = IDL.Record({ 'class' : AssetClass, 'symbol' : IDL.Text });
  const MarketDetails = IDL.Record({
    'vault_id' : IDL.Principal,
    'collateral_decimal' : IDL.Nat8,
    'quote_asset' : Asset,
    'base_asset' : Asset,
    'xrc_id' : IDL.Principal,
  });
  const LimitOrder = IDL.Record({
    'buy' : IDL.Bool,
    'init_lower_bound' : IDL.Nat,
    'init_removed_liquidity' : IDL.Nat,
    'init_tick_timestamp' : IDL.Nat64,
    'order_size' : IDL.Nat,
    'ref_tick' : IDL.Nat64,
  });
  const PositionOrderType = IDL.Variant({
    'Limit' : LimitOrder,
    'Market' : IDL.Null,
  });
  const PositionParameters = IDL.Record({
    'owner' : IDL.Principal,
    'debt_value' : IDL.Nat,
    'long' : IDL.Bool,
    'entry_tick' : IDL.Nat64,
    'order_type' : PositionOrderType,
    'timestamp' : IDL.Nat64,
    'interest_rate' : IDL.Nat32,
    'collateral_value' : IDL.Nat,
    'volume_share' : IDL.Nat,
  });
  const PositionStatus = IDL.Variant({
    'FILLED' : IDL.Null,
    'PARTIAL' : IDL.Null,
    'UNFILLED' : IDL.Null,
  });
  const StateDetails = IDL.Record({
    'max_leveragex10' : IDL.Nat8,
    'not_paused' : IDL.Bool,
    'current_tick' : IDL.Nat64,
    'base_token_multiple' : IDL.Nat8,
    'min_collateral' : IDL.Nat,
  });
  const TickState = IDL.Variant({ 'BUY' : IDL.Null, 'SELL' : IDL.Null });
  const LiquidityBoundary = IDL.Record({
    'upper_bound' : IDL.Nat,
    'lower_bound' : IDL.Nat,
    'lifetime_removed_liquidity' : IDL.Nat,
  });
  const TickDetails = IDL.Record({
    'tick_state' : TickState,
    'liq_bounds' : LiquidityBoundary,
    'created_timestamp' : IDL.Nat64,
  });
  const OrderType = IDL.Variant({ 'Limit' : IDL.Null, 'Market' : IDL.Null });
  const Result = IDL.Variant({ 'Ok' : PositionParameters, 'Err' : IDL.Text });
  return IDL.Service({
    'closePosition' : IDL.Func([IDL.Nat8, IDL.Opt(IDL.Nat64)], [IDL.Nat], []),
    'getAccountPositionDetails' : IDL.Func(
        [IDL.Principal, IDL.Nat8],
        [IDL.Opt(IDL.Tuple(PositionParameters, PositionStatus))],
        ['query'],
      ),
    'getBestOfferTick' : IDL.Func([IDL.Bool], [IDL.Nat64], ['query']),
    'getMarketDetails' : IDL.Func([], [MarketDetails], ['query']),
    'getStateDetails' : IDL.Func([], [StateDetails], ['query']),
    'getTickDetails' : IDL.Func([IDL.Nat64], [TickDetails], ['query']),
    'liquidatePosition' : IDL.Func([IDL.Principal, IDL.Nat8], [IDL.Bool], []),
    'openPosition' : IDL.Func(
        [
          IDL.Nat8,
          IDL.Nat,
          IDL.Bool,
          OrderType,
          IDL.Nat8,
          IDL.Opt(IDL.Nat64),
          IDL.Nat64,
          IDL.Nat64,
        ],
        [Result],
        [],
      ),
    'retryAccountError' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'startTimer' : IDL.Func([], [], []),
    'successNotification' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Nat64], [], []),
    'updateStateDetails' : IDL.Func([StateDetails], [], []),
  });
};
export const init = ({ IDL }) => {
  const AssetClass = IDL.Variant({
    'Cryptocurrency' : IDL.Null,
    'FiatCurrency' : IDL.Null,
  });
  const Asset = IDL.Record({ 'class' : AssetClass, 'symbol' : IDL.Text });
  const MarketDetails = IDL.Record({
    'vault_id' : IDL.Principal,
    'collateral_decimal' : IDL.Nat8,
    'quote_asset' : Asset,
    'base_asset' : Asset,
    'xrc_id' : IDL.Principal,
  });
  return [MarketDetails];
};
