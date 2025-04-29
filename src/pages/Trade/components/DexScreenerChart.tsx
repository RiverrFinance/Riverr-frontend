import React, { useEffect, useState } from "react";

interface DexScreenerChartProps {
  chart_id: string;
}

const DexScreenerChart: React.FC<DexScreenerChartProps> = ({ chart_id }) => {
  const [chartUrl, setChartUrl] = useState("");

  useEffect(() => {
    const baseUrl = "https://dexscreener.com";
    const chartParams =
      "embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15";

    let url = `${baseUrl}/icp/${chart_id}?${chartParams}`;

    setChartUrl(url);
  }, [chart_id]);

  return (
    <div className="w-full h-full bg-[#18191D] !rounded-3xl !rounded-b-3xl border border-gray-800 overflow-hidden">
      <iframe
        src={chartUrl}
        className="w-full lg:h-full h-[600px] border-none"
        title="Dexscreener Trading Chart"
        allowFullScreen
      />
    </div>
  );
};

export default DexScreenerChart;
