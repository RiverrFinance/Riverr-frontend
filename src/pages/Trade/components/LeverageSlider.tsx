interface Props {
  value: number;
  setLeverage: (val: number) => void;
  maxLeverage: number;
}

export const LeverageSlider = ({
  value,
  setLeverage,
  maxLeverage = 100,
}: Props) => {
  const leveragePoints = [1, 10, 20, 40, 60, 80, 100];

  return (
    <div className="space-y-3 px-1">
      <div className="relative">
        {/* Track container */}
        <div className="relative w-full h-1 bg-gray-700 rounded-full mx-1 mt-6 mb-1">
          {" "}
          {/* Adjusted margins */}
          {/* Active Track */}
          <div
            className="absolute h-full bg-[#0300AD] rounded-full"
            style={{
              width: `calc(${(value / maxLeverage) * 100}% - ${
                (((value / maxLeverage) * 100) / 100) * 4
              }px)`,
              left: "2px",
            }}
          />
          {/* Vertical Lines - now pointing upwards */}
          <div className="absolute inset-0">
            {leveragePoints.map((point) => {
              const position = (point / maxLeverage) * 100;
              return (
                <div
                  key={point}
                  className="absolute -bottom-1 h-3" // Changed from top-0 to bottom-0
                  style={{
                    left: `calc(${position}% - ${(position / 100) * 4}px)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div
                    className={`w-px h-full ${
                      value >= point ? "bg-[#0300AD]" : "bg-gray-600"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Leverage Points Labels - moved above the track */}
        <div className="relative w-full -mt-1">
          {" "}
          {/* Negative margin to pull up */}
          {leveragePoints.map((point) => {
            const position = (point / maxLeverage) * 100;
            return (
              <span
                key={point}
                className={`absolute text-xs ${
                  value >= point ? "text-white font-medium" : "text-gray-400"
                }`}
                style={{
                  left: `calc(${position}% - ${(position / 100) * 4}px)`,
                  transform: "translateX(-50%)",
                  top: "1.5rem", // Positioned above the track
                }}
              >
                {point}x
              </span>
            );
          })}
        </div>

        {/* Hidden Slider Input */}
        <input
          title="Leverage Slider"
          type="range"
          min="0.1"
          max={maxLeverage}
          step="0.1"
          value={value}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
        />

        {/* dialog */}
        <div
          className="absolute bottom-full"
          style={{
            left: `calc(${(value / maxLeverage) * 100}% - ${
              (((value / maxLeverage) * 100) / 100) * 4
            }px)`,
            transform: "translateX(-50%) translateY(-0.5rem)",
          }}
        >
          <div className="relative">
            <div className="text-white text-xs font-medium px-2 py-0.5 bg-[#0300AD] rounded-md whitespace-nowrap">
              {value.toFixed(1)}x
            </div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#0300AD] transform -translate-x-1/2 translate-y-1/2 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};
