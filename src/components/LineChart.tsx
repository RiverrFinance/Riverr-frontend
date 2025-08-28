interface LineChartProps {
  isPositive: boolean;
}

const LineChart = ({ isPositive }: LineChartProps) => {
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const gradientId = `gradient-${isPositive ? 'positive' : 'negative'}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center h-8">
      <svg className="w-20 h-8" viewBox="0 0 80 32" style={{ filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.3))' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        
        {/* Filled area under the curve */}
        <path
          d={
            isPositive
              ? "M0 24 L16 20 L32 16 L48 12 L64 8 L80 4 L80 32 L0 32 Z"
              : "M0 8 L16 12 L32 16 L48 20 L64 24 L80 28 L80 32 L0 32 Z"
          }
          fill={`url(#${gradientId})`}
        />
        
        {/* Main line with smooth curves */}
        <path
          d={
            isPositive
              ? "M0 24 Q8 22 16 20 Q24 18 32 16 Q40 14 48 12 Q56 10 64 8 Q72 6 80 4"
              : "M0 8 Q8 10 16 12 Q24 14 32 16 Q40 18 48 20 Q56 22 64 24 Q72 26 80 28"
          }
          stroke={strokeColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Glow effect */}
        <path
          d={
            isPositive
              ? "M0 24 Q8 22 16 20 Q24 18 32 16 Q40 14 48 12 Q56 10 64 8 Q72 6 80 4"
              : "M0 8 Q8 10 16 12 Q24 14 32 16 Q40 18 48 20 Q56 22 64 24 Q72 26 80 28"
          }
          stroke={strokeColor}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
          style={{ filter: `blur(2px)` }}
        />
      </svg>
    </div>
  );
};
export default LineChart;
