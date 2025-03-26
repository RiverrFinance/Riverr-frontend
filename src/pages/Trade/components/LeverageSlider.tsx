interface Props {
  value: number;
  setLeverage: (val: number) => void;
  maxLeverage: number;
}

export const LeverageSlider = ({ value, setLeverage, maxLeverage }: Props) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Leverage</span>
        <span className="text-white font-medium">{value}x</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max={maxLeverage}
          value={value}
          onChange={(e) => {
            let { value } = e.target;
            setLeverage(Number(value));
          }}
          className="w-full h-1 bg-[#1C1C28] rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
