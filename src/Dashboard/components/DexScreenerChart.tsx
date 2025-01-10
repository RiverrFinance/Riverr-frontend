function DexScreenerChart() {
  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <iframe
        src="https://dexscreener.com/icp/angxa-baaaa-aaaag-qcvnq-cai?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
        width="100%"
        height="600"
        style={{ border: 'none' }}
        title="Dexscreener Trading Chart"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default DexScreenerChart;
