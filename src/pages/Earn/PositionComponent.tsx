interface Props {
  StakeId: bigint;

  onUnstake: (id: bigint) => void; 
}
export default function StakePositionComponent({
  StakeId,
  onUnstake, 
}: Props) {
  const currentApy = "23%";
  const stakeDuration = "2 Month";
  const timeRemaining = "1 Month 24 days";


  return (
    <div className="bg-[#1C1C28] rounded-md p-4 space-y-2 text-white">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold">POSITION ID: {StakeId.toString()}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
        <div>
          <p>Current APY</p>
          <p className="text-green-500 font-semibold">{currentApy}</p>
        </div>
        <div>
          <p>DURATION</p>
          <p className="text-white font-semibold">{stakeDuration}</p>
        </div>
        <div>
          <p>TIME REMAINING</p>
          <p className="text-white font-semibold">{timeRemaining}</p>
        </div>
      </div>

      <div className="mt-4">
        <button
        type="button"
          className="w-full py-2 rounded-md font-semibold transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => onUnstake(StakeId)} 
        >
          Close Position
        </button>
      </div>
    </div>
  );
}
