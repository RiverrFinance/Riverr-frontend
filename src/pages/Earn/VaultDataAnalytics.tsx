import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
        position: "bottom" as const,
        labels: {
          color: "#fff",
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: "70%",
  };

  return (
    <div className="grid grid-rows-[1fr_1fr] gap-4 h-full">
      <div className="grid grid-cols-2 gap-4 min-h-0">
        {/* Risk Analysis Chart */}
        <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
          <h3 className="text-lg font-bold mb-2">Risk Analysis</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer>
              <Doughnut
                data={{
                  labels: riskData.map((d) => d.name),
                  datasets: [
                    {
                      data: riskData.map((d) => d.value),
                      backgroundColor: COLORS.risk,
                      borderWidth: 0,
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            </ResponsiveContainer>
          </div>
        </div>

        {/* APY Overview Chart */}
        <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
          <h3 className="text-lg font-bold mb-2">APY Overview</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer>
              <Doughnut
                data={{
                  labels: apyData.map((d) => d.name),
                  datasets: [
                    {
                      data: apyData.map((d) => d.value),
                      backgroundColor: COLORS.apy,
                      borderWidth: 0,
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row - Lending Distribution */}
      <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0">
        <h3 className="text-lg font-bold mb-2">Lending Distribution</h3>
        <div className="flex-1 w-full h-[100px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={leverageData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                cy="50%"
                stroke="none"
              >
                {leverageData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.default[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
