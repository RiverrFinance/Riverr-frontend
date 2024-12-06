import React from 'react';

interface TradingFormProps {
  onSubmit: (data: any) => void;
}

export const TradingForm: React.FC<TradingFormProps> = ({ onSubmit }) => {
  return (
    <div className="bg-[#1C1C28] p-4 rounded-lg">
      {/* Trading Type Selector */}
      <div className="flex mb-4 bg-[#2A2A3A] rounded-lg p-1">
        <button className="flex-1 py-2 rounded bg-blue-600 text-white">Long</button>
        <button className="flex-1 py-2 text-gray-400 hover:text-white">Short</button>
        <button className="flex-1 py-2 text-gray-400 hover:text-white">Swap</button>
      </div>

      {/* Trading Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Pay</label>
          <div className="flex bg-[#2A2A3A] rounded-lg p-2">
            <input 
              type="number" 
              className="flex-1 bg-transparent text-white outline-none"
              placeholder="0.00"
            />
            <select className="bg-[#2A2A3A] text-white outline-none" title="Pay">
              <option>USDT</option>
              <option>BTC</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Long</label>
          <div className="flex bg-[#2A2A3A] rounded-lg p-2">
            <input 
              type="number" 
              className="flex-1 bg-transparent text-white outline- none"
              placeholder="0.00"
            />
            <select className="bg-[#2A2A3A] text-white outline-none" title="Long">
              <option>BTC</option>
            </select>
          </div>
        </div>

        {/* Leverage Slider */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            className="w-full"
            title="Leverage"
          />
        </div>

        <button 
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => onSubmit({})}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}; 