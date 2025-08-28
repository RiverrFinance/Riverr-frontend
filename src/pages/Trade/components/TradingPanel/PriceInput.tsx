import { useEffect, useState } from "react";
import { Market } from "../../../../lists/marketlist";
import { tickToPrice } from "../../utilFunctions";
import { HttpAgent } from "@dfinity/agent";
import { MarketActor } from "../../../../utils/Interfaces/marketActor";
import { SECOND } from "../../../../utils/constants";

interface Props {
  readAgent: HttpAgent;
  market: Market;
  inputable: boolean;
  value: string;
  setLimitPrice: (val: string) => void;
  long: boolean;
}

export const PriceInput = ({
  market,
  value,
  setLimitPrice,
  readAgent,
  inputable,
  long,
}: Props) => {
  const [fetchSuccess, setFetchSuccess] = useState<boolean>(false);
  const [highestBuyOffer, setHighestBuyOffer] = useState<bigint>(0n);
  const [lowestSellOffer, setLowestSellOffer] = useState<bigint>(0n);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (market.market_id) {
      fetchSetBestOffers();
      interval = setInterval(() => {
        fetchSetBestOffers();
      }, 10 * SECOND);
    } else {
      setHighestBuyOffer(0n);
      setLowestSellOffer(0n);
    }
    return () => {
      clearInterval(interval);
    };
  }, [market, long]);

  const startingPoint = (): string => {
    if (long) {
      return tickToPrice(highestBuyOffer);
    } else {
      return tickToPrice(lowestSellOffer);
    }
  };

  const fetchSetBestOffers = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readAgent);
      const [hbo, lso] = await marketActor.getBestOffersTicks();
      setHighestBuyOffer(hbo);
      setLowestSellOffer(lso);
      setFetchSuccess(true);
    } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-400 font-medium">Current Price</span>{" "}
        <span className="text-gray-400 font-medium">{tickToPrice(lowestSellOffer)}</span>
      </div>
      <div className="flex items-center gap-3 glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
        <input
          type="number"
          disabled={
            !fetchSuccess || !inputable || market.market_id == undefined
          }
          placeholder={`${startingPoint()}`}
          value={value}
          onChange={(e) => {
            let { value } = e.target;
            if (Number(value) < 0) return;
            setLimitPrice(value);
          }}
          className="flex-1 bg-transparent text-white outline-none text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-500"
        />
      </div>
    </div>
  );
};
