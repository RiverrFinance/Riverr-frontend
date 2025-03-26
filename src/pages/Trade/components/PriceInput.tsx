import { useEffect, useState } from "react";
import { Market } from "../../../lists/marketlist";
import { tickToPrice } from "../utilFunctions";

interface Props {
  market: Market;
  value: string;
  initialTick: bigint;
  setLimitPrice: (val: string) => void;
}

export const PriceInput = ({
  market,
  value,
  setLimitPrice,
  initialTick,
}: Props) => {
  const [fetchSuccess, setFetchSuccess] = useState<boolean>(false);

  const currentSetPrice = () => {
    if (fetchSuccess) {
      return value;
    } else {
      return tickToPrice(initialTick);
    }
  };

  useEffect(() => {}, []);
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Current Price</span>{" "}
        <span className="text-gray-400">{tickToPrice(initialTick)}</span>
      </div>
      <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
        <input
          disabled={fetchSuccess && market.market_id == null}
          type="number"
          value={currentSetPrice()}
          onChange={(e) => {
            let { value } = e.target;
            setLimitPrice(value);
            setFetchSuccess(true);
          }}
          className="flex-1 bg-transparent text-white outline-none text-lg"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};
