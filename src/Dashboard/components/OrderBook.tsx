import React from 'react';

interface Order {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  buyOrders: Order[];
  sellOrders: Order[];
}

export const OrderBook: React.FC<OrderBookProps> = ({ buyOrders, sellOrders }) => {
  return (
    <div className="bg-[#1C1C28] p-4 rounded-lg">
      <div className="text-sm text-gray-400 grid grid-cols-3 gap-4 mb-2">
        <div>Price (USDT)</div>
        <div>Quantity (BTC)</div>
        <div>Total</div>
      </div>
      
      {/* Sell Orders */}
      <div className="space-y-1">
        {sellOrders.map((order, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-red-500">{order.price.toFixed(2)}</div>
            <div className="text-gray-300">{order.quantity.toFixed(6)}</div>
            <div className="text-gray-300">{order.total.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Current Price */}
      <div className="my-2 py-2 border-y border-gray-700">
        <div className="text-white text-center font-semibold">
          57,671.88 USDT
        </div>
      </div>

      {/* Buy Orders */}
      <div className="space-y-1">
        {buyOrders.map((order, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-green-500">{order.price.toFixed(2)}</div>
            <div className="text-gray-300">{order.quantity.toFixed(6)}</div>
            <div className="text-gray-300">{order.total.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}; 