import { Agent } from "@dfinity/agent";
import {
  createActor as createTokenActor,
  token as TokenIDL,
} from "../declarations/token/index";

import {
  createActor as createMinterActor,
  minter as MinterIDL,
} from "../declarations/minter/index";

import { Principal } from "@dfinity/principal";
import { Account } from "../declarations/token/token.did";

export class MinterActor {
  minter: typeof MinterIDL;

  constructor(canisterId: string, agent: Agent) {
    this.minter = createMinterActor(canisterId, {
      agent,
    });
  }
  public async mint(
    asset: Principal,
    user: Principal,
    amount: bigint
  ): Promise<boolean> {
    let result = await this.minter.mint(asset, user, amount);

    return result;
  }
}

export class TokenActor {
  token: typeof TokenIDL;
  constructor(canisterId: string, agent: Agent) {
    this.token = createTokenActor(canisterId, {
      agent,
    });
  }

  public async decimals(): Promise<number> {
    return await this.token.icrc1_decimals();
  }

  public async name(): Promise<string> {
    return await this.token.icrc1_name();
  }

  public async balance(user: Principal): Promise<bigint> {
    return this.token.icrc1_balance_of({
      owner: user,
      subaccount: [],
    });
  }

  public async allowance(user: Principal, spender: Principal): Promise<bigint> {
    let { allowance } = await this.token.icrc2_allowance({
      account: {
        owner: user,
        subaccount: [],
      },
      spender: {
        owner: spender,
        subaccount: [],
      },
    });

    return allowance;
  }

  public async approveSpending(
    amount: bigint,
    spender: Principal
  ): Promise<boolean> {
    let result = await this.token.icrc2_approve({
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount,
      expected_allowance: [],
      expires_at: [],
      spender: {
        owner: spender,
        subaccount: [],
      },
    });

    if ("Ok" in result) {
      console.log(result.Ok);
      return true;
    } else {
      console.log(result.Err);
      return false;
    }
  }

  public async receiveFaucet(
    receiver: Principal,
    amount: bigint
  ): Promise<boolean> {
    let result = await this.token.icrc1_transfer({
      to: { owner: receiver, subaccount: [] },
      amount,
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
    });
    if ("Ok" in result) {
      console.log(result.Ok);
      return true;
    } else {
      console.log(result.Err);
      return false;
    }
  }
}

// export interface ApproveArgs {
//   'fee' : [] | [bigint],
//   'memo' : [] | [Uint8Array | number[]],
//   'from_subaccount' : [] | [Uint8Array | number[]],
//   'created_at_time' : [] | [bigint],
//   'amount' : bigint,
//   'expected_allowance' : [] | [bigint],
//   'expires_at' : [] | [bigint],
//   'spender' : Account,
// }
