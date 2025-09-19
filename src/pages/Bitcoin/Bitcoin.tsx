import React, { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { BitcoinActionButton } from "./BitcoinActionButton";
import { toast } from "sonner";
import { assetList } from "../../lists/marketlist";

export default function BitcoinICPExchange() {
  const [activeInput, setActiveInput] = useState("pay");

  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  const [payToken, setPayToken] = useState("BTC");
  const [receiveToken, setReceiveToken] = useState("ICP");

  const [btcWalletConnected, setBtcWalletConnected] = useState(false);
  const [icpWalletConnected, setIcpWalletConnected] = useState(false);

  const [btcBalance] = useState("0.5423");
  const [icpBalance] = useState("1250.75");

  const handleSwitch = () => {
    // Switch tokens
    const tempToken = payToken;
    setPayToken(receiveToken);
    setReceiveToken(tempToken);

    // Switch amounts
    const tempAmount = payAmount;
    setPayAmount(receiveAmount);
    setReceiveAmount(tempAmount);

    // Switch active input
    setActiveInput(activeInput === "pay" ? "receive" : "pay");
  };

  const handlePayAmountChange = (e) => {
    const value = e.target.value;
    setPayAmount(value);
  };

  const handleReceiveAmountChange = (e) => {
    const value = e.target.value;
    setReceiveAmount(value);
  };

  const connectBitcoinWallet = () => {
    setBtcWalletConnected(true);
  };

  const getAvailableBalance = (token) => {
    return token === "BTC" ? btcBalance : icpBalance;
  };

  const handleExchange = async () => {
    const promise = () =>
      new Promise((resolve, reject) => {
        // Simulating API call
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve("Exchange completed successfully");
          } else {
            reject(new Error("Exchange failed - please try again"));
          }
        }, 3000); // Simulate 3 second delay
      });

    toast.promise(promise, {
      loading: "Processing exchange...",
      success: (data) => {
        return `${data}`;
      },
      error: (err) => {
        return `${err.message}`;
      },
      duration: Infinity, 
    });
  };

  return (
    <div className="flex items-center justify-center w-full h-full lg:px-4">
      <div className="w-full max-w-[480px] p-4">
        {/* Main Container */}
        <div className="w-full">
          {/* Header */}
          <div className="flex max-sm:flex-col justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              BTC/ICP Exchange
            </h2>
            <BitcoinActionButton
              isConnected={btcWalletConnected}
              onConnect={connectBitcoinWallet}
              error={null}
              token="BTC"
            />
          </div>

          {/* Swap Container */}
          <div className="relative space-y-1">
            {/* Pay Input */}
            <div
              className={`relative rounded-3xl py-7 px-5 max-sm:py-5 max-sm:px-4 bg-[#12131a] transition-all duration-200 cursor-pointer h-[140px] max-sm:h-[120px] overflow-hidden
                ${
                  activeInput === "pay"
                    ? "border border-white/10 hover:border hover:border-[#0300AD]/60"
                    : "border border-[#363c52]/40 bg-[#363c52]/40"
                }`}
              onClick={() => setActiveInput("pay")}
            >
              <div className="flex justify-between mb-1">
                <label className="text-lg max-sm:text-sm text-gray-400">Pay</label>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={payAmount}
                  onChange={handlePayAmountChange}
                  placeholder="0"
                  className="flex-1 bg-transparent text-3xl max-sm:text-2xl font-medium text-white outline-none placeholder-gray-600"
                />
                <div className="flex items-center gap-2 bg-[#1a1b23] p-2 rounded-xl min-w-[100px] max-sm:min-w-[60px] justify-center">
                  <img
                    src={
                      payToken === "BTC"
                        ? assetList[2].logoUrl
                        : assetList[0].logoUrl
                    }
                    alt={payToken}
                    className="w-6 h-6 max-sm:w-4 max-sm:h-4 rounded-full object-contain"
                  />
                  <span className="text-base max-sm:text-sm  font-medium text-white">
                    {payToken}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm max-sm:text-xs text-gray-500">
                  Available: {getAvailableBalance(payToken)} {payToken}
                </span>
              </div>
            </div>

            {/* Switch Button */}
            <button
              title="Switch Pay and Receive"
              type="button"
              onClick={handleSwitch}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#1a1b23] hover:bg-[#2c2d3d] transition-all duration-200 rounded-lg p-2 border border-[#ffffff]/10"
            >
              <ArrowDownUp size={26} className="text-white" />
            </button>

            {/* Receive Input */}
            <div
              className={`relative rounded-3xl py-7 px-5 max-sm:py-5 max-sm:px-4 bg-[#12131a] transition-all duration-200 cursor-pointer h-[140px] max-sm:h-[120px] overflow-hidden
                ${
                  activeInput === "receive"
                    ? "border border-white/10 hover:border hover:border-[#0300AD]/60"
                    : "border border-[#363c52]/40 bg-[#363c52]/40"
                }`}
              onClick={() => setActiveInput("receive")}
            >
              <div className="flex justify-between mb-1">
                <label className="text-lg max-sm:text-sm text-gray-400">Receive</label>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={receiveAmount}
                  onChange={handleReceiveAmountChange}
                  placeholder="0"
                  className="flex-1 bg-transparent text-3xl max-sm:text-2xl font-medium text-white outline-none placeholder-gray-600"
                />
                <div className="flex items-center gap-2 bg-[#1a1b23] p-2 rounded-xl min-w-[100px] max-sm:min-w-[60px]  justify-center">
                  <img
                    src={
                      receiveToken === "BTC"
                        ? assetList[2].logoUrl
                        : assetList[0].logoUrl
                    }
                    alt={receiveToken}
                    className="w-6 h-6 max-sm:w-4 max-sm:h-4 rounded-full object-contain"
                  />
                  <span className="text-base max-sm:text-sm font-medium text-white">
                    {receiveToken}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm max-sm:text-xs text-gray-500">
                  Available: {getAvailableBalance(receiveToken)} {receiveToken}
                </span>
              </div>
            </div>

            {/* Exchange Rate Info */}
            {(payAmount || receiveAmount) && (
              <div className="mt-4 p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Fee</span>
                  <span className="text-white">
                    1 {payToken} = {payToken === "BTC" ? "1500" : "0.000667"}{" "}
                    {receiveToken}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-4 pt-5">
              <BitcoinActionButton
                isConnected={icpWalletConnected}
                onConnect={handleExchange}
                error={null}
                isICP
                token="ICP"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
