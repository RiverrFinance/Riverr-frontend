const ONE_PERCENT: number = 100000;

export const tickToPrice = (tick: bigint): string => {
  let price = Number(tick) / (100 * ONE_PERCENT);

  return price.toString();
};

export const priceToTick = (price: string): bigint => {
  return BigInt(Number(price) * 100 * ONE_PERCENT);
};
