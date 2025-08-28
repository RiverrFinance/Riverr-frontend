import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, Eye, EyeOff } from 'lucide-react';

const GradientBackgroundBackward = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-800/10 to-green-600/20 opacity-50" />
);

const TradingDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(42150.75);
  const [priceChange, setPriceChange] = useState(2.34);
  const [volume24h, setVolume24h] = useState(2400000);
  const [showChart, setShowChart] = useState(true);

  // Generate realistic trading data
  useEffect(() => {
    const generateData = () => {
      const data = [];
      let basePrice = 42000;
      
      for (let i = 0; i < 24; i++) {
        const volatility = (Math.random() - 0.5) * 1000;
        basePrice += volatility;
        data.push({
          time: `${i}:00`,
          price: Math.max(40000, Math.min(44000, basePrice)),
          volume: Math.floor(Math.random() * 500000) + 100000
        });
      }
      return data;
    };

    const data = generateData();
    setChartData(data);
    
    // Update current price based on last data point
    if (data.length > 0) {
      setCurrentPrice(data[data.length - 1].price);
      const change = ((data[data.length - 1].price - data[0].price) / data[0].price * 100);
      setPriceChange(change);
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 100;
        return Math.max(40000, Math.min(44000, prev + change));
      });
      setPriceChange(prev => prev + (Math.random() - 0.5) * 0.5);
      setVolume24h(prev => prev + (Math.random() - 0.5) * 100000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = priceChange >= 0;

  const format = (price) => {
    if (!price) return "0.00";
    return price < 1
      ? price.toFixed(6)
      : price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  return (
    <div className="py-5 max-xs:py-2 px-5 max-xs:px-2 h-full glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden">
      {/* <GradientBackgroundBackward /> */}
      {/* <div className="glass rounded-lg md:rounded-2xl py-10 md:px-10 px-12 h-full flex flex-col gap-6"> */}
        
        {/* Header Section - Similar to your existing components */}
        <div className="flex max-xs:flex-col max-xs:gap-8 justify-between items-start xs:items-center">
          <div className="flex flex-col max-xs:items-center space-y-2">
            <div className="xs:space-y-5 flex max-xs:gap-5 gap-x-3 flex-col max-xs:items-start">
              <div className="text-md text-gray-300">
                Trading Status
              </div>
              <div className="text-[35px] font-bold space-x-2 transition-all text-green-400">
                <span>Active</span>
              </div>
              <div className="text-sm text-gray-400">
                24h Volume: ${format(volume24h / 1000000)}M
              </div>
            </div>
          </div>

          {/* <div className="flex flex-col items-center justify-items-center gap-2 w-fit overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs text-gray-300 text-center">
              Live Trading
              <br />
              Enabled
            </span>
          </div> */}
        </div>

        {/* Price Information Section */}
        <div className="glass rounded-lg md:rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-gray-400 uppercase tracking-wide">
                BTC/USD
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                ${format(currentPrice)}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>
            
            <button
              type="button"
              title="Toggle chart visibility"
              onClick={() => setShowChart(!showChart)}
              className="cursor-pointer text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {showChart ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Chart Section */}
          {showChart && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">24H Price Movement</span>
              </div>
              <div className="h-32 md:h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? "#10B981" : "#EF4444"}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: isPositive ? "#10B981" : "#EF4444", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Trading Stats Grid - Similar to your Top Movers layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Active Trades</div>
            <div className="text-lg font-bold text-green-400">1,247</div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Win Rate</div>
            <div className="text-lg font-bold text-blue-400">73.2%</div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">24h P&L</div>
            <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${format(12450)}
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Open Orders</div>
            <div className="text-lg font-bold text-white">23</div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-sm text-gray-300">
              System Status: <span className="text-green-400 font-medium">Operational</span>
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      {/* </div> */}
    </div>
  );
};

export default TradingDashboard;