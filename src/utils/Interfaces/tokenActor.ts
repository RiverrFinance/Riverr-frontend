import { Agent } from "@dfinity/agent";
import {
  createActor as createTokenActor,
  token as TokenIDL,
} from "../declarations/token/index";

import { Principal } from "@dfinity/principal";

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
}
export class TestTokenActor {
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
      return true;
    } else {
      return false;
    }
  }
}
