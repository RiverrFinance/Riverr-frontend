import React, { useEffect, useState } from 'react';
import { CurrencyPair } from '../../types/trading';

interface DexScreenerChartProps {
  selectedQuoteCurrency?: string;
  selectedPair?: CurrencyPair | null;
}

const DexScreenerChart: React.FC<DexScreenerChartProps> = ({
  selectedQuoteCurrency = 'ICP',
  selectedPair = null
}) => {
  const [chartUrl, setChartUrl] = useState('');

  useEffect(() => {
    const baseUrl = 'https://dexscreener.com';
    const chartParams = 'embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15';

    let url;
    if (selectedPair) {
      url = `${baseUrl}/${selectedPair.chainId}/${selectedPair.pairAddress}?${chartParams}`;
      console.log('Chart URL:', url); // Debug log
    } else if (selectedQuoteCurrency.toLowerCase() === 'icp') {
      url = `${baseUrl}/icp/angxa-baaaa-aaaag-qcvnq-cai?${chartParams}`;
    } else {
      // Default ETH/USDT pair
      url = `${baseUrl}/ethereum/0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852?${chartParams}`;
    }

    setChartUrl(url);
  }, [selectedQuoteCurrency, selectedPair]);

  return (
    <div className="w-full h-full bg-[#13131F] rounded-lg border border-gray-800 overflow-hidden">
      <iframe
        src={chartUrl}
        className="w-full"
        height="600"
        style={{ border: 'none' }}
        title="Dexscreener Trading Chart"
        allowFullScreen
      />
    </div>
  );
};

export default DexScreenerChart;
