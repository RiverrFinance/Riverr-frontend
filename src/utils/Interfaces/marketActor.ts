import { Principal } from "@dfinity/principal";
import { Agent } from "@dfinity/agent";
import {
  createActor as createMarket,
  market as marketIDL,
} from "../declarations/market/index";
import {
  _SERVICE,
  PositionParameters,
  StateDetails,
  MarketDetails,
  PositionStatus,
} from "../declarations/market/market.did";

export class MarketActor {
  market: typeof marketIDL;
  constructor(canisteId: string, agent: Agent) {
    this.market = createMarket(canisteId, { agent });
  }

  public async closeLimitOrder(account_index: number): Promise<bigint> {
    let amount = await this.market.closeLimitPosition(account_index);
    console.log(`the amount out is ${amount}`);

    return amount;
  }

  public async closeMarketOrder(account_index: number): Promise<bigint> {
    let amount = await this.market.closeMarketPosition(account_index, []);
    console.log(`the amount out is ${amount}`);

    return amount;
  }

  public async openLimitOrder(
    index: number,
    long: boolean,
    collatreal: bigint,
    leverage: number,
    maxtick: bigint
  ): Promise<string | null> {
    let result = await this.market.openLimitPosition(
      index,
      long,
      collatreal,
      leverage,
      maxtick
    );
    if ("Ok" in result) {
      return null;
    } else {
      return result.Err;
    }
  }

  public async opneMarketOrder(
    index: number,
    long: boolean,
    collatreal: bigint,

    leverage: number,
    maxtick: [] | [bigint]
  ): Promise<string | null> {
    let result = await this.market.openMarketPosition(
      index,
      long,
      collatreal,
      leverage,
      maxtick
    );
    if ("Ok" in result) {
      return null;
    } else {
      return result.Err;
    }
  }

  public async getaccountPositiondetails(
    user: Principal,
    index: number
  ): Promise<[[PositionParameters, PositionStatus, bigint]] | []> {
    return await this.market.getAccountPositionDetails(user, index);
  }

  public async getStateDetails(): Promise<StateDetails> {
    return this.market.getStateDetails();
  }

  public async getMarketDetails(): Promise<MarketDetails> {
    return await this.market.getMarketDetails();
  }

  public async getBestOffersTicks(): Promise<[bigint, bigint]> {
    return await this.market.getBestOffers();
  }
}
