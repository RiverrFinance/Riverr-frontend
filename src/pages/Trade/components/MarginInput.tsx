import { Market } from "../../../lists/marketlist";
import { formatUnits } from "ethers/lib/utils";
import { InputError } from "../types/trading";
import { parseUnits } from "ethers/lib/utils";
import { useAuth } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import { Agent, HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../../utils/utilFunction";
import { VaultActor } from "../../../utils/Interfaces/vaultActor";

interface Props {
  value: string;
  market: Market;
  setMargin: (value: string) => void;
  setError: (err: InputError) => void;
  readWriteAgent?: Agent | undefined;
  readAgent: HttpAgent;
  minCollateral: bigint;
}

export const MarginInput = ({
  value,
  setMargin: setFunction,
  market,
  setError,
  minCollateral,
  readWriteAgent,
  readAgent,
}: Props) => {
  //  const readWriteAgent = useAuth();
  const { user } = useAuth();
  const [userMarginBalance, setUserMarginBalance] = useState<bigint>(0n);

  useEffect(() => {
    let interval: number | undefined;
    if (readWriteAgent) {
      fetchSetMarginBalance();
      interval = setInterval(() => {
        if (readWriteAgent) {
          fetchSetMarginBalance();
        }
      }, 10000);
    } else {
      setUserMarginBalance(0n);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  //
  const fetchSetMarginBalance = async () => {
    try {
      if (market.quoteAsset.vaultID) {
        const vault = new VaultActor(market.quoteAsset.vaultID, readAgent);
        const margin = await vault.userMarginBalance(user.principal);

        setUserMarginBalance(margin);
      }
    } catch (error) {}
  };

  const onCollateralChange = (value: string) => {
    setFunction(value);
    if (value == "") {
      setError("");
    } else {
      let factorValue = parseUnits(
        value,
        market.quoteAsset.decimals
      ).toBigInt();
      if (factorValue > userMarginBalance) {
        setError("Insufficient Balance");
      } else if (factorValue < minCollateral) {
        setError("Smaller than min collateral");
      } else {
        setError("");
      }
    }

    setFunction(value);
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Collateral</span>
        <span className="text-gray-400">
          Available:
          {formatUnits(userMarginBalance, market.quoteAsset.decimals)}
          {market.quoteAsset.symbol}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
        <input
          disabled={market.market_id == null}
          type="number"
          value={value}
          onChange={(e) => {
            let { value } = e.target;
            onCollateralChange(value);
          }}
          className="flex-1 bg-transparent text-white outline-none text-lg"
          placeholder="0.00"
        />
        <div>{market.quoteAsset.symbol}</div>
      </div>
    </div>
  );
};
