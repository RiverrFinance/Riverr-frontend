import { useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { IconButton } from "../../components/Navbar";

interface Props {
  price: number;
  asset: Asset;
  userBalance: string;
  priceChange24h: number;
  index: number;
  openAccordionIndex: number;
  onAccordionToggle: (index: number) => void;
  onDeposit: (asset: Asset) => void;
  onWithdraw: (asset: Asset) => void;
}

export const AssetComponent = function AssetComponent({
  asset,
  price,
  userBalance,
  priceChange24h,
  index,
  openAccordionIndex,
  onAccordionToggle,
  onDeposit,
  onWithdraw,
}: Props) {
  const isAccordionOpen = index === openAccordionIndex;
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1000);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // line chart
  const renderLineChart = (isPositive: boolean) => {
    const color = isPositive ? "text-green-400" : "text-red-400";
    const strokeColor = isPositive ? "stroke-green-400" : "stroke-red-400";

    return (
      <div className="flex items-center h-8">
        <svg className="w-12 h-6" viewBox="0 0 50 24">
          <path
            d="M0 20 L8 16 L16 18 L24 12 L32 14 L40 8 L48 6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className={strokeColor}
          />
          <circle cx="48" cy="6" r="2" className={`fill-current ${color}`} />
        </svg>
      </div>
    );
  };
  const isPositiveChange = priceChange24h >= 0;

  return (
    <div className="mb-4">
      <div
        className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group relative"
        onClick={() => onAccordionToggle(index)}
      >
        <div className="flex items-start justify-between mb-4">
          {/* Left side - Currency info */}
          <div className="flex items-center gap-4">
            {/* Currency Icon */}
            {asset.logoUrl && (
              <img
                src={asset.logoUrl}
                alt={asset.name}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}

            {/* Currency details */}
            <div>
              <div className="text-lg font-semibold text-white">
                {asset.symbol}
              </div>
              <div className="text-xs capitalize text-gray-400">
                {asset.name}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isPositiveChange ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <div
              className={`text-xs font-medium ${
                isPositiveChange ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositiveChange ? "↗" : "↘"}
            </div>
          </div>
        </div>

        {/* Balance Amount */}
        <div className="text-3xl font-bold text-white mb-4">{userBalance}</div>

        {/* Bottom row - Change indicators and chart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Price */}
            <div className="text-sm text-white">${formatPrice(price)}</div>

            {/* Percentage change pill */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isPositiveChange
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {isPositiveChange ? "+" : ""}
              {priceChange24h.toFixed(2)}%
            </div>
          </div>

          {/* Chart */}
          <div className={isPositiveChange ? "text-green-400" : "text-red-400"}>
            {renderLineChart(isPositiveChange)}
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#14024262] to-[#02074c1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Chain connector */}
      {isAccordionOpen && (
        <div className="flex justify-between px-8">
          <div className="w-px h-4 bg-gradient-to-b from-blue-400 to-blue-600" />
          <div className="w-[0.5px] h-4 bg-gradient-to-b from-blue-400 to-blue-600" />
        </div>
      )}

      {/* Expanded Actions */}
      <div
        className={`glass rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 ease-out ${
          isAccordionOpen
            ? "opacity-100 max-h-32 translate-y-0"
            : "opacity-0 max-h-0 translate-y-4 overflow-hidden"
        }`}
      >
        <div className="flex gap-3">
          <IconButton
            onClick={() => onDeposit(asset)}
            title="Deposit"
            className="flex-1 bg-gradient-to-r from-blue-600/15 to-blue-700/15 hover:from-blue-600/30 hover:to-blue-700/30 text-blue-300 hover:text-blue-200 text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:shadow-blue-500/15 border border-blue-500/20 backdrop-blur-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
          </IconButton>
          <IconButton
            onClick={() => onWithdraw(asset)}
            title="Withdraw"
            className="flex-1 bg-gradient-to-r from-gray-600/15 to-gray-700/15 hover:from-gray-600/30 hover:to-gray-700/30 text-gray-300 hover:text-gray-200 text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:shadow-gray-500/15 border border-gray-500/20 backdrop-blur-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
