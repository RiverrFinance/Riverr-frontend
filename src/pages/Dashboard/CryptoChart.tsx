import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface CryptoChartProps {
  pricesArray: number[];
  priceChange24hArray: number[];
  assetNames?: string[];
}

interface ChartDataPoint {
  time: string;
  price: number;
  asset: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ 
  pricesArray, 
  priceChange24hArray, 
  assetNames = [] 
}) => {
  // Create chart data from existing price data
  const createChartData = (): ChartDataPoint[] => {
    if (!pricesArray.length) return [];
    
    // Use the first asset's price as primary chart data
    const primaryPrice = pricesArray[0] || 0;
    const primaryChange = priceChange24hArray[0] || 0;
    const primaryAsset = assetNames[0] || 'Asset';
    
    // Generate hourly data points based on the 24h change
    const data: ChartDataPoint[] = [];
    const now = new Date();
    const hourlyChange = primaryChange / 24; // Distribute change across 24 hours
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const progressRatio = (24 - i) / 24;
      const priceAtTime = primaryPrice * (1 - (primaryChange / 100) + (primaryChange / 100) * progressRatio);
      
      data.push({
        time: time.getHours().toString().padStart(2, '0') + ':00',
        price: Math.max(0, priceAtTime),
        asset: primaryAsset,
      });
    }
    
    return data;
  };

  const chartData = createChartData();
  
  // Calculate overall trend
  const getOverallTrend = () => {
    if (!priceChange24hArray.length) return 0;
    return priceChange24hArray[0] || 0;
  };

  const overallChange = getOverallTrend();
  const isPositive = overallChange >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-white font-semibold">
            {`Price: $${payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show loading state if no data
  if (!pricesArray.length || !chartData.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[180px]">
        <div className="text-gray-400 text-sm">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="0%" 
                stopColor={isPositive ? "#10b981" : "#ef4444"} 
                stopOpacity={0.3}
              />
              <stop 
                offset="100%" 
                stopColor={isPositive ? "#10b981" : "#ef4444"} 
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            hide
            domain={['dataMin * 0.95', 'dataMax * 1.05']}
          />
          <CustomTooltip />
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            fill="url(#cryptoGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: isPositive ? "#10b981" : "#ef4444",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CryptoChart;