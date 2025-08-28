import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface CryptoChartProps {
  pricesArray: number[];
  priceChange24hArray: number[];
  assetNames: string[];
}

const CryptoChart: React.FC<CryptoChartProps> = ({
  pricesArray,
  priceChange24hArray,
  assetNames,
}) => {
  const icpIndex = 0;
  const icpPriceNow = pricesArray[icpIndex] ?? 0;
  const icpChangePct = priceChange24hArray[icpIndex] ?? 0;
  const icpPrice24h = useMemo(() => {
    const denom = 1 + (icpChangePct / 100);
    if (denom === 0) return icpPriceNow;
    return icpPriceNow / denom;
  }, [icpPriceNow, icpChangePct]);

  const chartData = useMemo(() => {
    const points = 24; // approximate hourly points for last 24h
    const data = [] as Array<{ name: string; uv: number }>;
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const price = icpPrice24h + (icpPriceNow - icpPrice24h) * t;
      const uv = price - icpPrice24h; // offset so split gradient can be centered at 0
      data.push({ name: `${i}`, uv });
    }
    return data;
  }, [icpPrice24h, icpPriceNow]);

  const gradientOffset = () => {
    const dataMax = Math.max(...chartData.map((i) => i.uv));
    const dataMin = Math.min(...chartData.map((i) => i.uv));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  const isUp = icpPriceNow >= icpPrice24h;
  const primaryColor = isUp ? '#10b981' : '#ef4444';

  return (
    <div className="w-full h-[110px] md:h-[130px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2b3147" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="uv"
            stroke={primaryColor}
            strokeOpacity={0.5}
            strokeWidth={4}
            fillOpacity={0}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="uv"
            stroke={primaryColor}
            strokeWidth={2}
            fill="url(#areaFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CryptoChart;