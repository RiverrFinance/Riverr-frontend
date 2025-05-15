import { formatUnits, parseUnits } from "ethers/lib/utils";

const ONE_PERCENT: number = 100000;
const HUNDRED_PERCENT: number = 10000000;

export const tickToPrice = (tick: bigint): string => {
  return formatUnits(tick, 7);
  // let price = Number(tick) / (100 * ONE_PERCENT);

  // return price.toString();
};

export const priceToTick = (price: string): bigint => {
  return parseUnits(price, 7).toBigInt();
};
