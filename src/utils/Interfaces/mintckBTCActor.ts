import { Agent } from "@dfinity/agent";
import {
  createActor as createMinterActor,
  btc_minter as btcMinterIDL,
} from "../declarations/btc_minter/index";
import { Principal } from "@dfinity/principal";
import {
  RetrieveBtcOk,
  RetrieveBtcWithApprovalArgs,
  RetrieveBtcWithApprovalError,
} from "../declarations/btc_minter/btc_minter.did";

export class CKBTCMinterActor {
  minter: typeof btcMinterIDL;
  constructor(canisterId: string, agent: Agent) {
    this.minter = createMinterActor(canisterId, { agent });
  }

  public async getDepositFee(): Promise<bigint> {
    return await this.minter.get_deposit_fee();
  }

  public async getWithdrawalFeeEstimate(
    amount: bigint
  ): Promise<{ minter_fee: bigint; bitcoin_fee: bigint }> {
    return await this.minter.estimate_withdrawal_fee({ amount: [amount] });
  }

  public async getBTCAddress(user: Principal): Promise<string> {
    return await this.minter.get_btc_address({ owner: [user], subaccount: [] });
  }

  public async retrieveBTCWithApproval(
    btcAddress: string,
    amount: bigint
  ): Promise<{ Ok: RetrieveBtcOk } | { Err: RetrieveBtcWithApprovalError }> {
    let result = await this.minter.retrieve_btc_with_approval({
      address: btcAddress,
      amount: amount,
      from_subaccount: [],
    });
    return result;
  }
}
