import { useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import ManageLeverage from "./ManageLeverage";
import ManageStaking from "./ManageStaking";
import { useAgent } from "@nfid/identitykit/react";
import { HttpAgent } from "@dfinity/agent";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { VaultStakingDetails } from "../../utils/declarations/vault/vault.did";
import { VaultActor } from "../../utils/Interfaces/vaultActor";

ChartJS.register(ArcElement, ChartTooltip, Legend);

export const Earn = () => {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assetList[0]);
  const [vaultStakingDetails, setVaultStakingDetails] =
    useState<VaultStakingDetails>();
  const [activeTab, setActiveTab] = useState<"Lending" | "Stake">("Lending");

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  useEffect(() => {
    fetchSetVaultStakingDetails();
    const interval: NodeJS.Timeout = setInterval(() => {
      fetchSetVaultStakingDetails();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedAsset]);

  const fetchSetVaultStakingDetails = async (): Promise<any> => {
    const { vaultID } = selectedAsset;
    if (!vaultID) return;
    try {
      const vaultActor = new VaultActor(vaultID, readAgent);
      const details = await vaultActor.getVaultStakingDetails();
      setVaultStakingDetails(details);
    } catch (e) {
      console.error("Error fetching vault staking details", e);
    }
  };

  const PoolUtilzationData = [
    { name: "Free Liquidity", value: 60 },
    { name: "Borrowed Liqudity", value: 300 },
  ];

  const LiqudityLockUpData = [
    { name: "Low Risk", value: 10 },
    { name: "Medium Risk", value: 45 },
    { name: "High Risk", value: 25 },
  ];

  const apyData = [
    { name: "Current APY", value: 75 },
    { name: "Potential APY", value: 25 },
  ];

  const COLORS = {
    default: ["#0300AD", "#1C1C28"],
    apy: ["#0300AD", "#18CCFC"],
    liqudityLockUpData: ["#0300AD", "#2E5CFF", "#18CCFC"],
  };

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
        enabled: true, // Re-enable tooltips
      },
    },
    cutout: "70%",
    events: [
      "mousemove",
      "mouseout",
      "touchstart",
      "touchmove",
    ] as (keyof HTMLElementEventMap)[], // Only allow events needed for tooltips
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 h-[calc(100vh-80px)]">
      <div className="lg:col-span-8 grid grid-rows-[auto_1fr] gap-4">
        {/* Summary Card */}
        <div className="p-6 bg-[#18191de9] rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 relative h-full auto-rows-fr">
          {/* <GlowingEffect spread={20} glow={true} disabled={false} proximity={50} /> */}
          <div className="relative z-10 h-full">
            <h1 className="text-2xl font-bold mb-4">Welcome</h1>
            <p className="text-gray-400 mb-6">
              Earn passive income by providing liquidity or staking your assets
            </p>

            {/* Currency Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {assetList.map((asset) => (
                <button
                  title="Select Asset"
                  type="button"
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`flex items-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
                    selectedAsset.symbol === asset.symbol
                      ? "bg-[#0300ad18] border-2 border-[#0300AD]"
                      : "bg-[#1C1C28] hover:bg-[#0300ad18] border-2 border-transparent"
                  }`}
                >
                  <img
                    src={asset.logoUrl}
                    alt={asset.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-medium">{asset.symbol}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "Lending" && (
          <div className="grid grid-rows-[1fr_1fr] gap-4 h-full">
            {/* Top row - Risk Analysis and APY Overview */}
            <div className="grid grid-cols-2 gap-4 min-h-0">
              <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col">
                <h3 className="text-lg font-bold mb-2">Liqudity Lock Data</h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer>
                    <Doughnut
                      data={{
                        labels: LiqudityLockUpData.map((d) => d.name),
                        datasets: [
                          {
                            data: LiqudityLockUpData.map((d) => d.value),
                            backgroundColor: COLORS.liqudityLockUpData,
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        ...doughnutOptions,
                        plugins: {
                          ...doughnutOptions?.plugins,
                          legend: {
                            position: "bottom",
                            labels: {
                              color: "#ffffff",
                              usePointStyle: true,
                              pointStyle: "circle",
                              padding: 20, // Space between items
                              boxWidth: 10, // Color indicator size
                              boxHeight: 10,
                              font: {
                                size: 12,
                              },
                              generateLabels: (chart) => {
                                const data = chart.data;
                                if (
                                  data.labels?.length &&
                                  data.datasets?.length
                                ) {
                                  return data.labels.map((label, i) => ({
                                    text: String(label), // Ensure text is a string
                                    fillStyle:
                                      data.datasets[0].backgroundColor[i],
                                    fontColor: "#fff",
                                    strokeStyle: "transparent",
                                    lineWidth: 0,
                                    hidden: false,
                                    index: i,
                                  }));
                                }
                                return [];
                              },
                            },
                          },
                        },
                      }}
                    />
                  </ResponsiveContainer>
                </div>
              </div>

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
                      options={{
                        ...doughnutOptions,
                        plugins: {
                          ...doughnutOptions?.plugins,
                          legend: {
                            position: "bottom",
                            labels: {
                              color: "#ffffff",
                              usePointStyle: true,
                              pointStyle: "circle",
                              padding: 20, // Space between items
                              boxWidth: 10, // Color indicator size
                              boxHeight: 10,
                              font: {
                                size: 12,
                              },
                              generateLabels: (chart) => {
                                const data = chart.data;
                                if (
                                  data.labels?.length &&
                                  data.datasets?.length
                                ) {
                                  return data.labels.map((label, i) => ({
                                    text: String(label), // Ensure text is a string
                                    fillStyle:
                                      data.datasets[0].backgroundColor[i],
                                    fontColor: "#fff",
                                    strokeStyle: "transparent",
                                    lineWidth: 0,
                                    hidden: false,
                                    index: i,
                                  }));
                                }
                                return [];
                              },
                            },
                          },
                        },
                      }}
                    />
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom row - Lending Distribution */}
            <div className="bg-[#18191de9] rounded-3xl p-4 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0">
              <h3 className="text-lg font-bold mb-2 bg-transparent">
                Lending Distribution
              </h3>
              <div className="flex-1 w-full h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PoolUtilzationData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      cy="50%"
                      stroke="none"
                    >
                      {PoolUtilzationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.default[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#18191de9",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Stake" && (
          <div className="bg-[#18191de9] rounded-3xl p-6 border-2 border-dashed border-[#363c52] border-opacity-40 h-full">
            <h2 className="text-xl font-bold mb-4">Staking Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1C1C28] rounded-2xl">
                <div className="text-sm text-gray-400">Total Staked</div>
                <div className="text-2xl font-bold">$125,000</div>
              </div>
              <div className="p-4 bg-[#1C1C28] rounded-2xl">
                <div className="text-sm text-gray-400">Current APY</div>
                <div className="text-2xl font-bold text-green-500">12.5%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Management Panel */}
      <div className="lg:col-span-4 h-full">
        <div className="h-full border-l-2 border-r-2 border-dashed border-[#363c52] border-opacity-40 relative">
          {/* <GlowingEffect spread={20} glow={true} disabled={false} proximity={50} /> */}
          <div className="h-full p-6 flex flex-col gap-6">
            {/* Tab Selection */}
            <div className="flex relative p-1">
              <div className="flex relative z-10 w-full">
                {(["Lending", "Stake"] as const).map((tab) => (
                  <button
                    title="Select Tab"
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2 px-4 text-sm font-medium relative transition-colors duration-300"
                  >
                    <span
                      className={`relative z-10 ${
                        activeTab === tab
                          ? "text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>
              {/* Sliding background */}
              <div
                className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[#0300ad18] border-b-2 border-[#0300AD] transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(${
                    activeTab === "Lending" ? "0%" : "100%"
                  })`,
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === "Lending" ? (
                <ManageLeverage
                  readWriteAgent={readWriteAgent}
                  readAgent={readAgent}
                  selectedAsset={selectedAsset}
                />
              ) : (
                <ManageStaking
                  readWriteAgent={readWriteAgent}
                  readAgent={readAgent}
                  selectedAsset={selectedAsset}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
