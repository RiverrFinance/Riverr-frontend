import { Doughnut } from "react-chartjs-2";

const COLORS = {
  default: ["#0300AD", "#1C1C28"],
  apy: ["#0300AD", "#18CCFC"],
  risk: ["#0300AD", "#2E5CFF", "#18CCFC"],
};

export const VaultDataAnalytics = () => {
  const leverageData = [
    { name: "Supplied", value: 60 },
    { name: "Available", value: 40 },
  ];

  const riskData = [
    { name: "Low Risk", value: 30 },
    { name: "Medium Risk", value: 45 },
    { name: "High Risk", value: 25 },
  ];

  const apyData = [
    { name: "Current APY", value: 75 },
    { name: "Potential APY", value: 25 },
  ];

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          color: "#ffffff",
          usePointStyle: true,
          boxWidth: 4,
          boxHeight: 4,
          padding: 10,
          font: {
            size: 10,
            family: 'system-ui'
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#18191D',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    cutout: '65%',
  };

  return (
    <div className="grid grid-rows-[1fr_1fr] max-lg:grid-rows-[200px_200px] max-md:grid-rows-[400px_200px] grid-cols-1 max-sm:gap-3 gap-1 xl:gap-3 h-fit lg:h-[400px] max-lg:h-full max-lg:-mt-16">
      <div className="row-span-1 grid grid-cols-1 md:grid-cols-2 gap-3 max-sm:gap-3 max-md:gap-0 min-h-0 h-fit">
        {/* Risk Analysis Chart - Fixed border and container */}
        <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0 max-sm:h-full h-fit ">
          <h3 className="text-sm font-bold mb-1">Risk Analysis</h3>
          <div className="flex-1 w-full h-[140px]">
            <Doughnut
              data={{
                labels: riskData.map((d) => d.name),
                datasets: [{
                  data: riskData.map((d) => d.value),
                  backgroundColor: COLORS.risk,
                  borderWidth: 0,
                }]
              }}
              options={doughnutOptions}
            />
          </div>
        </div>

        {/* APY Overview Chart - Fixed border */}
        <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#3e445b] border-opacity-40 flex flex-col min-h-0 max-sm:h-full h-fit">
          <h3 className="text-sm font-bold mb-1">APY Overview</h3>
          <div className="flex-1 w-full h-[140px]">
            <Doughnut
              data={{
                labels: apyData.map((d) => d.name),
                datasets: [{
                  data: apyData.map((d) => d.value),
                  backgroundColor: COLORS.apy,
                  borderWidth: 0,
                }]
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

      {/* Lending Distribution - Fixed border and container */}
      <div className="row-span-1 bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0 max-sm:h-full max-lg:h-fit lg:h-full">
        <h3 className="text-sm font-bold mb-1">Lending Distribution</h3>
        <div className="flex-1 w-full h-[140px]">
          <Doughnut
            data={{
              labels: leverageData.map((d) => d.name),
              datasets: [{
                data: leverageData.map((d) => d.value),
                backgroundColor: COLORS.default,
                borderWidth: 0,
              }]
            }}
            options={doughnutOptions}
          />
        </div>
      </div>
    </div>
  );
};