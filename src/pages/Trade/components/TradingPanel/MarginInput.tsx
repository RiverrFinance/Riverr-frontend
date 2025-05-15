import { Market } from "../../../../lists/marketlist";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { InputError } from "../../types/trading";
import { useAuth } from "@nfid/identitykit/react";
import { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { VaultActor } from "../../../../utils/Interfaces/vaultActor";
import { SECOND } from "../../../../utils/constants";

interface Props {
  value: string;
  market: Market;
  setMargin: (value: string) => void;
  setError: (err: InputError) => void;
  readAgent: HttpAgent;
  minCollateral: bigint;
}

export const MarginInput = ({
  value,
  setMargin: setFunction,
  market,
  setError,
  minCollateral,
  readAgent,
}: Props) => {
  const { user } = useAuth();
  const readWriteAgent = useAuth();

  const [userMarginBalance, setUserMarginBalance] = useState<bigint>(0n);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (market.quoteAsset.vaultID && readWriteAgent) {
      fetchSetMarginBalance();
      interval = setInterval(() => {
        fetchSetMarginBalance();
      }, 10 * SECOND); //10 seconds
    } else {
      setUserMarginBalance(0n);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent, market]);

  //
  const fetchSetMarginBalance = async () => {
    try {
      if (market.quoteAsset.vaultID && user) {
        const vault = new VaultActor(market.quoteAsset.vaultID, readAgent);
        const margin = await vault.userMarginBalance(user.principal);

        setUserMarginBalance(margin);
      }
    } catch {
      return;
    }
  };

  const onCollateralChange = (value: string) => {
    if (Number(value) < 0) return;
    setFunction(value);
    if (value == "") {
      setError(null);
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
        setError(null);
      }
    }
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Collateral</span>
        <span className="text-gray-400">
          Available:{" "}
          {`${formatUnits(userMarginBalance, market.quoteAsset.decimals)}  ${
            market.quoteAsset.symbol
          }`}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
        <input
          disabled={!market.market_id}
          type="number"
          value={value}
          onChange={(e) => {
            let { value } = e.target;
            onCollateralChange(value);
          }}
          className="flex-1 bg-transparent text-white outline-none text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.00"
        />
        <div>{market.quoteAsset.symbol}</div>
      </div>
    </div>
  );
};
