import { Agent } from "@dfinity/agent";
import {
  createActor,
  clearing_house as clearingHouseIDL,
} from "../declarations/clearing_house/index";
import { Principal } from "@dfinity/principal";
import {
  HouseDetails,
  MarketDetails,
  MarketState,
  AssetPricingDetails,
  LiquidityOperationResult,
  ClosePositionResult,
  OpenPositioninMarketResult,
  AddLiquidityToMarketParams,
  CreateMarketParams,
  ClosePositionParams,
  DepositParams,
  RemoveLiquidityFromMarketParams,
  OpenPositionParams,
  WithdrawParams,
} from "../declarations/clearing_house/clearing_house.did";

export class ClearingHouse {
  clearingHouse: typeof clearingHouseIDL;
  constructor(canisteId: string, agent: Agent) {
    this.clearingHouse = createActor(canisteId, { agent });
  }

  public async addLiquidity(
    amount: bigint,
    params: AddLiquidityToMarketParams
  ): Promise<LiquidityOperationResult> {
    return await this.clearingHouse.addLiquidity(amount, params);
  }

  //   public async addMarket(
  //     params: CreateMarketParams,
  //     assetPricingDetails: AssetPricingDetails,
  //     marketState: MarketState
  //   ): Promise<void> {
  //     return await this.clearingHouse.add_market(
  //       params,
  //       assetPricingDetails,
  //       marketState
  //     );
  //   }

  public async closePosition(
    params: ClosePositionParams
  ): Promise<ClosePositionResult> {
    return await this.clearingHouse.closePosition(params);
  }

  public async deposit(params: DepositParams): Promise<boolean> {
    return await this.clearingHouse.deposit(params);
  }

  public async withdraw(params: WithdrawParams): Promise<boolean> {
    return await this.clearingHouse.withdraw(params);
  }

  public async getUserBalance(user: Principal): Promise<bigint> {
    return await this.clearingHouse.getUserBalance(user);
  }

  public async getUserMarketLiquidityShares(
    user: Principal,
    marketId: bigint
  ): Promise<bigint> {
    return await this.clearingHouse.getUserMarketLiquidityShares(
      user,
      marketId
    );
  }

  public async getMarketDetails(marketId: bigint): Promise<MarketDetails> {
    return await this.clearingHouse.get_market_details(marketId);
  }

  public async getMarketsCount(): Promise<bigint> {
    return await this.clearingHouse.get_markets_count();
  }

  public async openPosition(
    params: OpenPositionParams
  ): Promise<OpenPositioninMarketResult> {
    return await this.clearingHouse.openPosition(params);
  }

  public async removeLiquidity(
    marketId: bigint,
    params: RemoveLiquidityFromMarketParams
  ): Promise<LiquidityOperationResult> {
    return await this.clearingHouse.removeLiquidity(marketId, params);
  }
}
