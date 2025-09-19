import React, { memo, useEffect } from "react";
import { Modal, Icon } from "semantic-ui-react";
import { AlertCircle } from "lucide-react";
import Marketing_Campaign_1 from "../../images/Marketing_Campaign_1.png";

export interface PoolTransactionModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  actionType: "BUY" | "SELL";
  amount: string;
  onSubmitTransaction: () => Promise<void>;
  txError: string | null;
  symbol: string;
  currentAction: "Approving..." | "Processing..." | null;
  market?: {
    baseAsset: {
      logoUrl: string;
      symbol: string;
    };
    quoteAsset: {
      logoUrl: string;
      symbol: string;
    };
  };
}

export const PoolTransactionModal: React.FC<PoolTransactionModalProps> = memo(
  ({
    isOpen,
    onModalClose,
    actionType,
    amount,
    symbol,
    txError,
    currentAction,
    market,
  }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight =
          "var(--removed-body-scroll-bar-size, 0px)";
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }

      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }, [isOpen]);

    return (
      <Modal
        open={isOpen}
        onClose={onModalClose}
        size="tiny"
        className="!bg-transparent !p-0"
        dimmer={{
          className: "!bg-black/60 !backdrop-blur-sm",
        }}
      >
        <Modal.Content className="!bg-transparent !text-white !p-0 !shadow-none !border-none">
          <div className="glass !bg-[#09051bfd] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-md mx-auto">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                {currentAction ? (
                  // Loading State
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full glass bg-[#0300AD]/10 border border-[#0300AD]/20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0300AD]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        {currentAction}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Processing transaction...
                      </p>
                    </div>
                  </div>
                ) : txError ? (
                  // Error State
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="glass bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                        <img
                          src={Marketing_Campaign_1}
                          alt="Error"
                          className="w-24 h-24 mx-auto opacity-50"
                        />
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="glass bg-[#16182e]/80 backdrop-blur-sm rounded-full p-3 border border-red-500/20">
                          <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-3xl font-bold text-white uppercase">
                        Transaction Failed
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Your transaction could not be processed.
                      </p>
                    </div>

                    <div className="glass rounded-xl p-5 bg-red-500/5 border border-red-500/20 backdrop-blur-sm space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400 text-sm font-medium">
                          Error Details
                        </span>
                        <span className="text-red-400 text-sm font-medium">
                          Failed
                        </span>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />

                      <div className="py-2">
                        <p className="text-red-400 text-sm text-center leading-relaxed">
                          {txError}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Success State
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="glass bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                        <img
                          src={Marketing_Campaign_1}
                          alt="Success"
                          className="w-24 h-24 mx-auto"
                        />
                      </div>

                      {/* Token logos overlay */}
                      {market && (
                        <div className="absolute -bottom-1 -right-1">
                          <div className="relative">
                            <div className="glass bg-[#16182e]/80 backdrop-blur-sm rounded-full p-1 border border-white/10">
                              <img
                                src={market.baseAsset.logoUrl}
                                alt={market.baseAsset.symbol}
                                className="w-10 h-10 rounded-full"
                              />
                              <img
                                src={market.quoteAsset.logoUrl}
                                alt={market.quoteAsset.symbol}
                                className="w-6 h-6 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#16182e]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-3xl font-bold text-white uppercase">
                        Transaction Success
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {actionType === "BUY" ? "Purchased" : "Sold"}{" "}
                        successfully.
                      </p>
                    </div>

                    <div className="glass rounded-xl p-5 bg-[#0300AD]/5 border border-[#0300AD]/20 backdrop-blur-sm space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400 text-sm font-medium">
                          Action
                        </span>
                        <div
                          className={`flex items-center gap-2 font-semibold text-sm ${
                            actionType === "BUY"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          <Icon
                            name={
                              actionType === "BUY" ? "arrow up" : "arrow down"
                            }
                            size="small"
                          />
                          <span>{actionType} GM</span>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400 text-sm font-medium">
                          Amount
                        </span>
                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                          {market && (
                            <img
                              src={
                                actionType === "BUY"
                                  ? market.quoteAsset.logoUrl
                                  : market.baseAsset.logoUrl
                              }
                              alt={
                                actionType === "BUY"
                                  ? market.quoteAsset.symbol
                                  : market.baseAsset.symbol
                              }
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          <span>
                            {amount} {symbol}
                          </span>
                        </div>
                      </div>

                      {market && (
                        <>
                          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400 text-sm font-medium">
                              Pool
                            </span>
                            <div className="flex items-center gap-2 text-[#0300AD] font-semibold text-sm">
                              <div className="relative">
                                <img
                                  src={market.baseAsset.logoUrl}
                                  alt={market.baseAsset.symbol}
                                  className="w-4 h-4 rounded-full"
                                />
                                <img
                                  src={market.quoteAsset.logoUrl}
                                  alt={market.quoteAsset.symbol}
                                  className="w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border border-[#16182e]"
                                />
                              </div>
                              <span>
                                {market.baseAsset.symbol.toUpperCase()}/
                                {market.quoteAsset.symbol.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
);
