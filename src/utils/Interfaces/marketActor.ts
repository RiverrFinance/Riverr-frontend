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
  OrderType,
  PositionStatus,
} from "../declarations/market/market.did";

export class MarketActor {
  market: typeof marketIDL;
  constructor(canisteId: string, agent: Agent) {
    this.market = createMarket(canisteId, { agent });
  }

  public async closePosition(account_index: number): Promise<bigint> {
    let amount = await this.market.closePosition(account_index, []);

    return amount;
  }

  public async openPosition(
    index: number,
    collatreal: bigint,
    long: boolean,
    order_type: OrderType,
    leverage: number,
    maxtick: [] | [bigint]
  ): Promise<boolean> {
    let result = await this.market.openPosition(
      index,
      collatreal,
      long,
      order_type,
      leverage,
      maxtick,
      BigInt(0),
      BigInt(1)
    );
    if ("Ok" in result) {
      return true;
    } else {
      return false;
    }
  }

  public async getaccountPositiondetails(
    user: Principal,
    index: number
  ): Promise<[[PositionParameters, PositionStatus, bigint]] | []> {
    return await this.market.getAccountPositionDetails(user, index);
  }

  public async getStateDetails(): Promise<StateDetails> {
    return await this.market.getStateDetails();
  }

  public async getMarketDetails(): Promise<MarketDetails> {
    return await this.market.getMarketDetails();
  }

  public async getBestOffersTicks(): Promise<[bigint, bigint]> {
    return await this.market.getBestOffers();
  }
}
