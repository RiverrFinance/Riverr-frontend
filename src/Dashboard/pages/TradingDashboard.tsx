import React from 'react';
import { TradingChart } from '../components/TradingChart';
import { OrderBook } from '../components/OrderBook';
import { TradingForm } from '../components/TradingForm';
import { NavBar } from '../components/NavBar';

export const TradingDashboard: React.FC = () => {
  // Sample data for order book
  const buyOrders = [
    { price: 57671.88, quantity: 0.000268, total: 15.2860 },
    { price: 57671.44, quantity: 0.000232, total: 15.3230 },
    { price: 57671.21, quantity: 0.000342, total: 15.5460 },
  ];

  const sellOrders = [
    { price: 57671.34, quantity: 0.000123, total: 15.2213 },
    { price: 57671.12, quantity: 0.000345, total: 15.2213 },
    { price: 57671.22, quantity: 0.00062, total: 15.2545 },
  ];

  return (
    <div className="min-h-screen bg-[#13131F] text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">BTC/USDT</h1>
          <span className="text-gray-400">Bitcoin</span>
        </div>

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4">
        Left Side - Order Book
        <div className="col-span-3">
          <OrderBook buyOrders={buyOrders} sellOrders={sellOrders} />
        </div>

        {/* Middle - Chart */}
        <div className="col-span-6">
          <TradingChart symbol="BTC/USDT" interval="1h" />
        </div>

        {/* Right Side - Trading Form */}
        <div className="col-span-3">
          <TradingForm onSubmit={(data) => console.log(data)} />
        </div>
      </div>
    </div>
  );
}; 