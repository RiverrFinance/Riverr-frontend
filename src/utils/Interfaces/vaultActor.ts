import { Agent } from "@dfinity/agent";
import {
  createActor as createVaultActor,
  vault as vaultIDL,
} from "../declarations/vault/index";
import { Principal } from "@dfinity/principal";
import {
  StakeDetails,
  StakeSpan,
  VaultStakingDetails,
} from "../declarations/vault/vault.did";

export class VaultActor {
  vault: typeof vaultIDL;
  constructor(canisteId: string, agent: Agent) {
    this.vault = createVaultActor(canisteId, { agent });
  }

  public async userMarginBalance(user: Principal): Promise<bigint> {
    return await this.vault.getUserMarginBalance(user);
  }

  public async fundAccount(amount: bigint, user: Principal): Promise<boolean> {
    let tx = await this.vault.fundAccount(amount, [], user);
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
    let txresult = await this.vault.withdrawFromAccount(amount, {
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

  public async getUserStakes(
    user: Principal
  ): Promise<Array<[bigint, StakeDetails]>> {
    return this.vault.getUserStakes(user);
  }

  public async getVaultStakingDetails(): Promise<VaultStakingDetails> {
    return this.vault.getVaultStakingDetails();
  }

  public async provideLeverage(amount: bigint): Promise<boolean> {
    let txResult = await this.vault.provideLeverage(amount);
    if ("Ok" in txResult) {
      console.log("Leverage provided successfully:", txResult.Ok);
      return true;
    } else {
      console.error("Error providing leverage:", txResult.Err);
      return false;
    }
  }

  public async stakeVirtualTokens(
    amount: bigint,
    span: StakeSpan
  ): Promise<boolean> {
    let result = await this.vault.stakeVirtualTokens(amount, span, []);
    if ("Ok" in result) {
      return true;
    } else {
      return false;
    }
  }

  public async unstakeVirtualToken(stakeID: bigint): Promise<boolean> {
    let result = await this.vault.unStakeVirtualTokens(stakeID);
    if ("Ok" in result) {
      return true;
    } else {
      return false;
    }
  }
}

//   'approveMarket' : ActorMethod<[Principal], Result>,
//   'createPositionValidityCheck' : ActorMethod<
//     [Principal, bigint, bigint],
//     [boolean, number]
//   >,
//   'fundAccount' : ActorMethod<
//     [bigint, [] | [Uint8Array | number[]], Principal],
//     Result_1
//   >,
//   'getUserMarginBalance' : ActorMethod<[Principal], bigint>,
//   'getUserStakes' : ActorMethod<[Principal], Array<[bigint, StakeDetails]>>,
//   'getVaultDetails' : ActorMethod<[], VaultDetails>,
//   'getVaultStakingDetails' : ActorMethod<[], VaultStakingDetails>,
//   'managePositionUpdate' : ActorMethod<
//     [Principal, bigint, ManageDebtParams],
//     undefined
//   >,
//   'provideLeverage' : ActorMethod<[bigint], Result_2>,
//   'removeLeverage' : ActorMethod<
//     [bigint, [] | [Uint8Array | number[]]],
//     Result_2
//   >,
//   'stakeVirtualTokens' : ActorMethod<
//     [bigint, StakeSpan, [] | [Uint8Array | number[]]],
//     Result_3
//   >,
//   'unStakeVirtualTokens' : ActorMethod<[bigint], Result_3>,
//   'withdrawFromAccount' : ActorMethod<[bigint, Account], Result_3>,
//}
