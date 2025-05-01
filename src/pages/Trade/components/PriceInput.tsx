import { useEffect, useState } from "react";
import { Market } from "../../../lists/marketlist";
import { tickToPrice } from "../utilFunctions";
import { HttpAgent } from "@dfinity/agent";
import { MarketActor } from "../../../utils/Interfaces/marketActor";

interface Props {
  readAgent: HttpAgent;
  market: Market;
  value: string;
  setLimitPrice: (val: string) => void;
  long: boolean;
}

export const PriceInput = ({
  market,
  value,
  setLimitPrice,
  readAgent,
  long,
}: Props) => {
  const [fetchSuccess, setFetchSuccess] = useState<boolean>(false);
  // const [highestBuyOffer, setHighestBuyOffer] = useState<bigint>(0n);
  const [lowestSellOffer, setLowestSellOffer] = useState<bigint>(0n);

  useEffect(() => {
    fetchSetBestOffers();
    let interval: undefined | number;
    if (market.market_id) {
      interval = setInterval(() => {
        fetchSetBestOffers();
      }, 5000);
    }
    return () => {
      clearInterval(interval);
      setFetchSuccess(false);
    };
  }, [market, long]);

  const setDefaultPrice = (lso: bigint, hbo: bigint) => {
    if (long) {
      setLimitPrice(tickToPrice(hbo));
    } else {
      setLimitPrice(tickToPrice(lso));
    }
  };
  // highest buy ,lowest sell offer
  const fetchSetBestOffers = async () => {
    try {
      const marketActor = new MarketActor(market.market_id, readAgent);
      const [hbo, lso] = await marketActor.getBestOffersTicks();
      // setHighestBuyOffer(hbo);
      setLowestSellOffer(lso);
      if (!fetchSuccess) {
        setDefaultPrice(lso, hbo);
        setFetchSuccess(true);
      }
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Current Price</span>{" "}
        <span className="text-gray-400">{tickToPrice(lowestSellOffer)}</span>
      </div>
      <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
        <input
          disabled={!fetchSuccess}
          type="number"
          value={value}
          onChange={(e) => {
            let { value } = e.target;
            setLimitPrice(value);
          }}
          className="flex-1 bg-transparent text-white outline-none text-lg"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};
