export type OpenInterest = {
  long: number;
  short: number;
  longAmountMillions: string;
  shortAmountMillions: string;
};

export type AvailableLiquidity = {
  longLiquidityMillions: string;
  shortLiquidityMillions: string;
};

export type NetRate = {
  hourlyPercent: string;
  dailyPercent: string;
};

export const getStaticOpenInterest = (): OpenInterest => {
  const longPercentage = Math.floor(Math.random() * 40) + 45;
  const shortPercentage = 100 - longPercentage;
  const longAmount = (Math.random() * 50 + 30).toFixed(1);
  const shortAmount = (Math.random() * 50 + 20).toFixed(1);
  return {
    long: longPercentage,
    short: shortPercentage,
    longAmountMillions: longAmount,
    shortAmountMillions: shortAmount,
  };
};

export const getStaticAvailableLiquidity = (): AvailableLiquidity => {
  return {
    longLiquidityMillions: (Math.random() * 40 + 50).toFixed(1),
    shortLiquidityMillions: (Math.random() * 40 + 40).toFixed(1),
  };
};

export const getStaticNetRate = (): NetRate => {
  const hourlyRate = (Math.random() * 0.01 - 0.005).toFixed(5);
  const dailyRate = (parseFloat(hourlyRate) * 24).toFixed(4);
  return {
    hourlyPercent: hourlyRate,
    dailyPercent: dailyRate,
  };
};

export const formatMillions = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `$${num.toFixed(1)}m`;
};

export const formatLargeUSD = (value: number): string => {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const getOpenInterest = (): OpenInterest => {
  console.log("getOpenInterest called");
  return getStaticOpenInterest();
};

export const getReservedFactor = (): string => {
  console.log("getReservedFactor called");
  const val = (Math.random() * 20 + 10).toFixed(2);
  return `${val}%`;
};

export const formatPercentCompact = (value: number | string): string => {
  console.log("formatPercentCompact called", value);
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";
  return `${num.toFixed(2)}%`;
};
