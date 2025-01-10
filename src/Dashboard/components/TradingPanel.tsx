import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { TradingPanelProps, OrderData } from '../../types/trading';

export const TradingPanel: React.FC<TradingPanelProps> = ({
  maxLeverage = 100,
  defaultLeverage = 10,
  availableBalance = 0,
  supportedTokens = ['USDT'],
  defaultToken = 'USDT',
  onOrderSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'Long' | 'Short' | 'Swap'>('Long');
  const [payAmount, setPayAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(defaultLeverage);
  const [payToken, setPayToken] = useState<string>(defaultToken);
  const [receiveToken, setReceiveToken] = useState<string>('BTC');

  const handleSubmit = () => {
    if (onOrderSubmit) {
      onOrderSubmit({
        type: activeTab,
        payAmount: Number(payAmount),
        payToken,
        receiveAmount: Number(receiveAmount),
        receiveToken,
        leverage,
      });
    }
  };

  return (
    <div className={`bg-[#13131F] rounded-lg border border-gray-800`}>
      {/* Trading Type Selector */}
      <div className="flex p-1 bg-[#1C1C28] rounded-t-lg">
        {(['Long', 'Short', 'Swap'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 
              ${activeTab === type
                ? 'text-blue-500 font-medium text-md border border-blue-500 rounded-2xl px-4 py-1 transition-all duration-200'
                : 'text-gray-400 hover:text-white transition-colors duration-200 text-md'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Pay Input */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Pay</span>
            <span className="text-gray-400">
              Available: {availableBalance} {payToken}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none text-lg"
              placeholder="0.00"
            />
            <select
              value={payToken}
              onChange={(e) => setPayToken(e.target.value)}
              className="bg-[#1C1C28] text-white outline-none px-2 py-1 rounded"
            >
              {supportedTokens.map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Receive Input */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{activeTab}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
            <input
              type="number"
              value={receiveAmount}
              onChange={(e) => setReceiveAmount(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none text-lg"
              placeholder="0.00"
            />
            <select
              value={receiveToken}
              onChange={(e) => setReceiveToken(e.target.value)}
              className="bg-[#1C1C28] text-white outline-none px-2 py-1 rounded"
            >
              <option value="BTC">BTC</option>
            </select>
          </div>
        </div>

        {/* Leverage Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Leverage</span>
            <span className="text-white font-medium">{leverage}x</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max={maxLeverage}
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
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

        {/* Total */}
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Total</span>
          <span className="text-white">30,211.85 USDT</span>
        </div>

        {/* Pool Selection */}
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Pool</span>
          <div className="flex items-center gap-2">
            <span className="text-white">BTC-USDC</span>
            <Icon name="chevron down" className="text-gray-400" />
          </div>
        </div>

        {/* Styled ConnectWalletButton */}
        <div className=" flex justify-center">
          <ConnectWalletButton
            className="py-3 px-24"
            isConnected={false}
            isIconConnected={false}
          />
        </div>
      </div>
    </div>
  );
}; 