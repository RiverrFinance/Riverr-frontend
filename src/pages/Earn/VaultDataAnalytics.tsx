import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { VaultStakingDetails } from "../../utils/declarations/vault/vault.did";
import { HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST, SECOND } from "../../utils/constants";
import { Asset } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { formatUnits, parseUnits } from "ethers/lib/utils";

const COLORS = {
  default: ["#0300AD", "#1C1C28"],
  apy: ["#0300AD", "#18CCFC"],
  risk: ["#0300AD", "#2E5CFF", "#18CCFC"],
};

type lockedLiquidityVarianceType = {
  month2: number;
  month6: number;
  year1: number;
};

type PoolUtilizationMetricType = {
  debt: number;
  free_liquidity: number;
};

const defaultLiquidityVariance = {
  month2: 0,
  month6: 0,
  year1: 0,
};

interface Props {
  selectedAsset: Asset;
}

export const VaultDataAnalytics = ({ selectedAsset }: Props) => {
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());

  const [unLockedLiqudity, setUnLockedLiquidity] = useState<number>(0);
  const [lockedLiquidityVariance, setLockedLiquidityVariance] =
    useState<lockedLiquidityVarianceType>(defaultLiquidityVariance);
  const [poolUtilizationMetric, setPoolUtilizationMetric] =
    useState<PoolUtilizationMetricType>({ debt: 0, free_liquidity: 0 });

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
    let interval: NodeJS.Timeout;
    if (selectedAsset.vaultID) {
      fetchSetLiquidityAnalytics();
      interval = setInterval(() => {
        fetchSetLiquidityAnalytics();
      }, 10 * SECOND);
    }

    return () => {
      clearInterval(interval);
    };
  }, [selectedAsset]);

  const fetchSetLiquidityAnalytics = async () => {
    try {
      const vaultActor = new VaultActor(selectedAsset.vaultID, readAgent);
      let details: VaultStakingDetails =
        await vaultActor.getVaultStakingDetails();

      const { free_liquidity, debt } = details;
      setPoolUtilizationMetric({
        free_liquidity: Number(
          formatUnits(free_liquidity, selectedAsset.decimals)
        ),
        debt: Number(formatUnits(debt, selectedAsset.decimals)),
      });

      const { span12_details, span0_details, span2_details, span6_details } =
        details;

      setUnLockedLiquidity(
        Number(formatUnits(span0_details.total_locked, selectedAsset.decimals))
      );

      const variance: lockedLiquidityVarianceType = {
        month2: Number(
          formatUnits(span2_details.total_locked, selectedAsset.decimals)
        ),
        month6: Number(
          formatUnits(span6_details.total_locked, selectedAsset.decimals)
        ),
        year1: Number(
          formatUnits(span12_details.total_locked, selectedAsset.decimals)
        ),
      };
      setLockedLiquidityVariance(variance);
    } catch {
      return;
    }
  };

  const sumLockedLiquidty = (): number => {
    const { month6, month2, year1 } = lockedLiquidityVariance;
    return month2 + month6 + year1;
  };

  const LockedLiquditySpread = [
    { name: "2 Months Lock", value: lockedLiquidityVariance.month2 },
    { name: "6 Months Lock", value: lockedLiquidityVariance.month6 },
    { name: "1 Year Lock", value: lockedLiquidityVariance.year1 },
  ];

  const LiquidtyLockMetric = [
    {
      name: "Free Liqudity",
      value: unLockedLiqudity,
    },
    { name: "Locked Liqudity", value: sumLockedLiquidty() },
  ];

  // later
  const PoolUtilizationMetric = [
    { name: "Debt", value: poolUtilizationMetric.debt },
    { name: "Free Liqudity", value: poolUtilizationMetric.free_liquidity },
  ];

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        align: "center" as const,
        labels: {
          color: "#ffffff",
          usePointStyle: true,
          boxWidth: 4,
          boxHeight: 4,
          padding: 10,
          font: {
            size: 10,
            family: "system-ui",
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#18191D",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    cutout: "65%",
  };

  return (
    <div className="grid grid-rows-[1fr_1fr] max-lg:grid-rows-[200px_200px] max-md:grid-rows-[400px_200px] grid-cols-1 max-sm:gap-3 gap-1 xl:gap-3 h-fit lg:h-[400px] max-lg:h-full max-lg:-mt-16">
      <div className="row-span-1 grid grid-cols-1 md:grid-cols-2 gap-3 max-sm:gap-3 max-md:gap-0 min-h-0 h-fit">
        {/* Risk Analysis Chart - Fixed border and container */}
        <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0 max-sm:h-full h-fit ">
          <h3 className="text-sm font-bold mb-1">Locked Liquidty Spread</h3>
          <div className="flex-1 w-full h-[140px]">
            <Doughnut
              data={{
                labels: LockedLiquditySpread.map((d) => d.name),
                datasets: [
                  {
                    data: LockedLiquditySpread.map((d) => d.value),
                    backgroundColor: COLORS.risk,
                    borderWidth: 0,
                  },
                ],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>

        {/* APY Overview Chart - Fixed border */}
        <div className="bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#3e445b] border-opacity-40 flex flex-col min-h-0 max-sm:h-full h-fit">
          <h3 className="text-sm font-bold mb-1">Liquidty Lock Metric</h3>
          <div className="flex-1 w-full h-[140px]">
            <Doughnut
              data={{
                labels: LiquidtyLockMetric.map((d) => d.name),
                datasets: [
                  {
                    data: LiquidtyLockMetric.map((d) => d.value),
                    backgroundColor: COLORS.apy,
                    borderWidth: 0,
                  },
                ],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

      {/* Lending Distribution - Fixed border and container */}
      <div className="row-span-1 bg-[#18191de9] rounded-3xl p-3 border-2 border-dashed border-[#363c52] border-opacity-40 flex flex-col min-h-0 max-sm:h-full max-lg:h-fit lg:h-full">
        <h3 className="text-sm font-bold mb-1">Pool Utilization Metric</h3>
        <div className="flex-1 w-full h-[140px]">
          <Doughnut
            data={{
              labels: PoolUtilizationMetric.map((d) => d.name),
              datasets: [
                {
                  data: PoolUtilizationMetric.map((d) => d.value),
                  backgroundColor: COLORS.default,
                  borderWidth: 0,
                },
              ],
            }}
            options={doughnutOptions}
          />
        </div>
      </div>
    </div>
  );
};

const defaultVaultDetails = {};
