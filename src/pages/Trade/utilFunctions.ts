const ONE_PERCENT: number = 100000;

export const tickToPrice = (tick: bigint): string => {
  let price = Number(tick) / (100 * ONE_PERCENT);

  return price.toString();
};
