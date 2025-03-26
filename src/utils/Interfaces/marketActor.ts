import { Principal } from "@dfinity/principal";
import { Agent } from "@dfinity/agent";
import {
  createActor as createMarket,
  market as marketIDL,
} from "../declarations/market/index";
import {
  _SERVICE,
  PositionDetails,
  StateDetails,
  MarketDetails,
  OrderType,
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

  public async getStateDetails(): Promise<StateDetails> {
    return await this.market.getStateDetails();
  }

  public async getMarketDetails(): Promise<MarketDetails> {
    return await this.market.getMarketDetails();
  }

  public async getAccountPosition(
    account: Uint8Array | number[]
  ): Promise<PositionDetails> {
    return await this.market.getAccountPosition(account);
  }

  public async getPositionPNL(
    positionAccount: Uint8Array | number[]
  ): Promise<bigint> {
    return await this.market.getPositionPNL(positionAccount);
  }

  public async getUserAccount(
    principal: Principal,
    index: number
  ): Promise<Uint8Array | number[]> {
    return await this.market.getUserAccount(principal, index);
  }

  public async getBestOfferTick(buy: boolean): Promise<bigint> {
    return await this.market.getBestOfferTick(buy);
  }
}

// export interface _SERVICE {
//   'closePosition' : ActorMethod<[[] | [bigint]], bigint>,
//   'getAccountPosition' : ActorMethod<[Uint8Array | number[]], PositionDetails>,
//   'getBestOfferTick' : ActorMethod<[boolean], bigint>,
//   'getMarketDetails' : ActorMethod<[], MarketDetails>,
//   'getPositionPNL' : ActorMethod<[Uint8Array | number[]], bigint>,
//   'getStateDetails' : ActorMethod<[], StateDetails>,
//   'getTickDetails' : ActorMethod<[bigint], TickDetails>,
//   'getUserAccount' : ActorMethod<[Principal], Uint8Array | number[]>,
//   'liquidatePosition' : ActorMethod<[Principal], boolean>,
//   'openPosition' : ActorMethod<
//     [bigint, boolean, OrderType, number, [] | [bigint], bigint, bigint],
//     Result
//   >,
//   'positionStatus' : ActorMethod<[Uint8Array | number[]], [boolean, boolean]>,
//   'retryAccountError' : ActorMethod<[Principal], undefined>,
//   'startTimer' : ActorMethod<[], undefined>,
//   'successNotification' : ActorMethod<
//     [Uint8Array | number[], bigint],
//     undefined
//   >,
//   'updateStateDetails' : ActorMethod<[StateDetails], undefined>,
// }
