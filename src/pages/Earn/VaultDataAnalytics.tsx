import { ResponsiveContainer, Pie, Cell, Tooltip } from "recharts";
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
          },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets[0];
            return chart.data.labels.map((label: string, index: number) => ({
              fontColor: "#ffffff",
              text: label,
              fillStyle: datasets.backgroundColor[index],
              hidden: !chart.getDataVisibility(index),
              lineCap: 'round',
              lineDash: [],
              lineDashOffset: 0,
              lineJoin: 'round',
              lineWidth: 0,
              strokeStyle: datasets.backgroundColor[index],
              pointStyle: 'circle',
              datasetIndex: 0,
              index: index
            }));
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
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
      }
    }
  };

  return (
    <div className="grid grid-rows-[auto_auto] gap-3 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
        {/* Risk Analysis Chart */}
        <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
          <h3 className="text-sm font-bold mb-1">Risk Analysis</h3>
          <div className="flex-1 w-full h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* APY Overview Chart */}
        <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
          <h3 className="text-sm font-bold mb-1">APY Overview</h3>
          <div className="flex-1 w-full h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row - Lending Distribution */}
      <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0">
        <h3 className="text-sm font-bold mb-1">Lending Distribution</h3>
        <div className="flex-1 w-full h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
