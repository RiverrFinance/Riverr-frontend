import React, { useEffect, useState } from "react";
import RingLoader from "react-spinners/RingLoader";

interface DexScreenerChartProps {
  chart_id: string;
}

const DexScreenerChart: React.FC<DexScreenerChartProps> = ({ chart_id }) => {
  const [chartUrl, setChartUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const baseUrl = "https://dexscreener.com";
    const chartParams =
      "embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15";

    let url = `${baseUrl}/icp/${chart_id}?${chartParams}`;

    setChartUrl(url);
    setIsLoading(true);
    setIsError(false);
  }, [chart_id]);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <div className="w-full h-full glass rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 overflow-hidden relative">
      {(isLoading || isError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#18191D]/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-4">
            <RingLoader color="#ffffff" size={90} />
            {isError && (
              <div className="text-center">
                <div className="text-lg font-medium text-white mb-2">Chart Loading Error</div>
                <div className="text-sm text-gray-400">Please refresh the page to try again</div>
              </div>
            )}
          </div>
        </div>
      )}
      {!isError && (
        <iframe
          src={chartUrl}
          className="w-full h-full border-none"
          title="Dexscreener Trading Chart"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          style={{ visibility: isLoading ? "hidden" : "visible" }}
        />
      )}
    </div>
  );
};

export default DexScreenerChart;
