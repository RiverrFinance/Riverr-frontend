import { AreaChart as RechartsAreaChart, Area, ResponsiveContainer } from 'recharts';

export const CryptoAreaChart = ({ isPositive }: { isPositive: boolean }) => {
  const generatePriceData = (isPositive: boolean) => {
    const baseValue = 100;
    const volatility = 15;
    const trend = isPositive ? 1.2 : 0.8;
    
    return Array.from({ length: 24 }, (_, i) => {
      const trendValue = baseValue * Math.pow(trend, i / 12);
      const randomVariation = (Math.random() - 0.5) * volatility;
      const value = Math.max(0, trendValue + randomVariation);
      
      return {
        time: i,
        price: value,
      };
    });
  };

  const data = generatePriceData(isPositive);
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const fillColor = isPositive 
    ? "url(#positiveGradient)" 
    : "url(#negativeGradient)";

  return (
    <div className="w-24 h-14 sm:w-32 sm:h-16 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/>
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
              <stop offset="50%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill={fillColor}
            dot={false}
            activeDot={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};