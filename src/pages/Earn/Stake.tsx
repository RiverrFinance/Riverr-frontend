import { formatUnits } from "ethers/lib/utils";
import { LockDetails } from "../../utils/declarations/liquidity_manager/liquidity_manager.did";

interface Props {
  id: bigint;
  feesEarned: string;
  stake: LockDetails;
  unStake: () => void;
}
export default function Stake({ stake, id, feesEarned, unStake }: Props) {
  const isExpired = (): boolean => {
    let expiryTime = Number(stake.expiry_time / 1000000n);
    let currentTime: number = Date.now();

    return currentTime > expiryTime;
  };

  const timeRemaining = () => {
    let expiryTime = Number(stake.expiry_time / 1000000n);
    let currentTime: number = Date.now();
    if (currentTime > expiryTime) {
      return "0:00";
    } else {
      return formatDuration(expiryTime - currentTime);
    }
  };

  const formatDuration = (ms: number): string => {
    // If milliseconds are negative, convert them to positive
    if (ms < 0) ms = -ms;
    // Define an object 'time' to store the duration components
    const time = {
      day: Math.floor(ms / 86400000), // Calculate number of days
      hour: Math.floor(ms / 3600000) % 24, // Calculate number of hours (mod 24 to get the remaining hours)
      minute: Math.floor(ms / 60000) % 60,
      // Calculate number of milliseconds (mod 1000 to get the remaining milliseconds)
    };
    // Convert the 'time' object to an array of key-value pairs, filter out components with a value of 0, and format each component
    return Object.entries(time)
      .filter((val) => val[1] !== 0) // Filter out components with a value of 0
      .map((val) => val[1] + " " + (val[1] !== 1 ? val[0] + "s" : val[0])) // Format each component
      .join(", "); // Join the formatted components with a comma and space
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 bg-white/5 backdrop-blur-sm border border-white/10 space-y-3 text-white">
      <div className="flex justify-between items-center">
        <p className="text-sm sm:text-base font-semibold">
          POSITION ID: {formatUnits(id, 10)}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-gray-400">
        <div>
          <p>EARNINGS</p>
          <p className="text-green-400 font-semibold text-sm sm:text-base">{feesEarned}</p>
        </div>
        <div>
          <p>TIME REMAINING</p>
          <p className="text-white font-semibold text-sm sm:text-base">{timeRemaining()}</p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          disabled={!isExpired()}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
            isExpired()
              ? "bg-[#0300AD] text-white hover:bg-[#0300AD]/90 hover:-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
              : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => unStake()}
        >
          Close Position
        </button>
      </div>
    </div>
  );
}
