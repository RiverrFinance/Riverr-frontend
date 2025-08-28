import { Agent } from "@dfinity/agent";
import {
  createActor,
  liquidity_manager as liquidityManagerIDL,
} from "../declarations/liquidity_manager/index";
import { Principal } from "@dfinity/principal";
import {
  LockDetails,
  LockSpan,
  Vault,
} from "../declarations/liquidity_manager/liquidity_manager.did";

export class LiquidityManagerActor {
  manager: typeof liquidityManagerIDL;
  constructor(canisteId: string, agent: Agent) {
    this.manager = createActor(canisteId, { agent });
  }

  public async userMarginBalance(user: Principal): Promise<bigint> {
    return await this.manager.getUserMarginBalance(user);
  }

  public async fundAccount(amount: bigint, user: Principal): Promise<boolean> {
    let tx = await this.manager.fundAccount(amount, [], user);
    if ("Ok" in tx) {
      return true;
    } else {
      return false;
    }
  }

  public async withdrawfromAccount(
    amount: bigint,
    user: Principal
  ): Promise<boolean> {
    let txresult = await this.manager.withdrawFromAccount(amount, {
      owner: user,
      subaccount: [],
    });

    if ("Ok" in txresult) {
      console.log(txresult.Ok);
      return true;
    } else {
      console.log(txresult.Err);
      return false;
    }
  }

  public async getUserLocks(
    user: Principal
  ): Promise<Array<[bigint, LockDetails, bigint]>> {
    return this.manager.getUserLocks(user);
  }

  public async getVault(): Promise<Vault> {
    return this.manager.getVault();
  }

  public async lendToVault(amount: bigint): Promise<boolean> {
    let txResult = await this.manager.lendToVault(amount);
    if ("Ok" in txResult) {
      console.log("Leverage provided successfully:", txResult.Ok);
      return true;
    } else {
      console.error("Error providing leverage:", txResult.Err);
      return false;
    }
  }

  public async collectFromVault(amount: bigint): Promise<string> {
    let txResult = await this.manager.collectFromVault(amount, []);
    if ("Ok" in txResult) {
      console.log("Leverage removed successfully:", txResult.Ok);
      return "";
    } else {
      console.error("Error removed leverage:", txResult.Err);
      return txResult.Err;
    }
  }

  public async lockQTokens(amount: bigint, span: LockSpan): Promise<boolean> {
    let result = await this.manager.lockQTokens(amount, span, []);
    if ("Ok" in result) {
      return true;
    } else {
      return false;
    }
  }

  public async unlockQTokens(lockID: bigint): Promise<boolean> {
    let result = await this.manager.unlockQTokens(lockID);
    if ("Ok" in result) {
      return true;
    } else {
      return false;
    }
  }
}
