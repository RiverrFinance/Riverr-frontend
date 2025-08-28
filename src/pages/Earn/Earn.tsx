import { useEffect, useState } from "react";
import { Asset, assetList } from "../../lists/marketlist";
import ManageLeverage from "./ManageLeverage";
import ManageLock from "./ManageLock";
import { useAgent } from "@nfid/identitykit/react";
import { HttpAgent } from "@dfinity/agent";
import { Banknote, LineChart } from "lucide-react";
import { VaultDataAnalytics } from "./VaultDataAnalytics";
import { UserStakes } from "./UserStakes";
import { ICP_API_HOST } from "../../utils/constants";

//1,989.02 kB
export const Earn = () => {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assetList[0]);
  const [activeTab, setActiveTab] = useState<"Lending" | "Lock">("Lending");

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  const tabIcons = {
    Lending: Banknote,
    Lock: LineChart,
  } as const;

  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 sm:px-5 md:px-6 pt-4 sm:pt-6">
      {/* Header Section with Summary Card and Tabs */}
      <div className="grid max-lg:grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-8 glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 p-4 sm:p-6 lg:p-8">
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-4">Welcome</h1>
            <p className="text-gray-400 mb-4 lg:mb-6 text-sm lg:text-base">
              Earn passive income by providing liquidity or staking your assets
            </p>

            {/* Currency Selection */}
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-4">
              {assetList.map((asset) => (
                <button
                  title="Select Asset"
                  type="button"
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`flex items-center gap-2 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-300 ${
                    selectedAsset.symbol === asset.symbol
                      ? "bg-[#0300ad18] border-2 border-[#0300AD]"
                      : "bg-white/5 hover:bg-[#0300ad18] border-2 border-transparent"
                  }`}
                >
                  <img
                    src={asset.logoUrl}
                    alt={asset.symbol}
                    className="w-6 h-6 lg:w-8 lg:h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="text-sm lg:text-base font-medium">
                      {asset.symbol}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="lg:col-span-4 glass rounded-2xl md:rounded-3xl border-2 border-dashed border-[#363c52] border-opacity-40 p-4 sm:p-6 lg:p-8 flex items-center">
          <div className="flex gap-2 lg:gap-4 w-full">
            {(["Lending", "Lock"] as const).map((tab) => {
              const IconComponent = tabIcons[tab];
              return (
                <button
                  title="Select Tab"
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 p-3 lg:p-4 rounded-xl transition-all duration-300 text-xs lg:text-sm font-medium
                    ${
                      activeTab === tab
                        ? "bg-[#0300ad18] border-2 border-[#0300AD]"
                        : "bg-white/5 hover:bg-[#0300ad18] border-2 border-transparent"
                    }`}
                >
                  <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                    <IconComponent className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    <span>{tab}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 h-full">
        {/* Left Panel */}
        <div className="xl:col-span-8 lg:col-span-7 order-2 lg:order-1">
          {activeTab === "Lending" ? (
            <VaultDataAnalytics selectedAsset={selectedAsset} />
          ) : (
            <UserStakes
              readWriteAgent={readWriteAgent}
              readAgent={readAgent}
              selectedAsset={selectedAsset}
            />
          )}
        </div>

        {/* Right Panel - Operations */}
        <div className="xl:col-span-4 lg:col-span-5 order-1 lg:order-2">
          <div className="h-full">
            <div className="h-full">
              {activeTab === "Lending" ? (
                <ManageLeverage
                  readWriteAgent={readWriteAgent}
                  readAgent={readAgent}
                  selectedAsset={selectedAsset}
                />
              ) : (
                <ManageLock
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
