interface Props {
  value: number;
  setLeverage: (val: number) => void;
  maxLeverage: number;
  // disabled?: boolean; 
}

export const LeverageSlider = ({ value, setLeverage, maxLeverage }: Props) => { 
  const leveragePoints = [0, 2, 5, 10, 15, 25, 50, 75, 100]; 
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-3 items-center"> 
          <div className="w-full">
            <input
              title="range"
              type="range"
              min="0.0"
              max={maxLeverage}
              value={value}
              onChange={(e) => {
                let { value } = e.target;
                setLeverage(Number(value));
              }}
              className="w-full h-1 bg-[#1C1C28] rounded-lg appearance-none cursor-pointer accent-[#0300AD]"
              // disabled={disabled} 
            />
            <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-1">
              {leveragePoints.map(point => (
                <span key={point}>
                  {point}x 
                </span>
              ))}
            </div>
          </div>

          <span className="text-gray-400 text-[8px] px-3 py-[0.1px] font-medium border border-gray-700 rounded-md bg-[#23262F] h-[18px] flex items-center justify-center flex-shrink-0"> 
            {value}x
          </span>

        </div>
      </div>
    </div>
  );
};
