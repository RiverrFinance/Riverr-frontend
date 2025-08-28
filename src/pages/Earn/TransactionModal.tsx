import React, { useState, useEffect, memo } from "react";
import { Modal, Icon, Button } from "semantic-ui-react";
import { Asset, assetList } from "../../lists/marketlist";
import Modal_Icon from "../../images/Modal_Icon.png";
import Marketing_Campaign_1 from "../../images/Marketing_Campaign_1.png";
import { IconButton } from "../../components/Navbar";

export interface TransactionModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  actionType: "Deposit" | "Withdraw" | "Lock" | "Unlock";
  asset: Asset;
  amount: string;
  onSubmitTransaction: () => Promise<void>;
  txError: string | null;
  currentAction: "Approving..." | "Processing..." | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = memo(
  ({
    onModalClose,
    actionType,
    asset,
    amount,
    onSubmitTransaction,
    txError,
    isOpen,
    currentAction,
  }) => {
    const [view, setView] = useState<"preview" | "result">("preview");
    const [referenceAmount, setReferenceAmount] = useState<string>();

    useEffect(() => {
      if (view == "preview") {
        setReferenceAmount(amount);
      }
    }, [amount]);

    const submitTransaction = async () => {
      await onSubmitTransaction();
      setView("result");
    };

    const onClose = () => {
      setView("preview");
      onModalClose();
    };

    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        size="tiny"
        className="!bg-[#0A1022]/90 !backdrop-blur-xl !rounded-3xl !border !border-white/10 !p-0"
      >
        <Modal.Content className="!bg-transparent !text-white !p-5 space-y-5">
          {view === "preview" ? (
            <>
              <div className="!flex justify-between content-center items-center mb-5 !bg-transparent !text-white">
                <div className="text-xl font-bold flex items-center gap-2 w-full">
                  <img src={Modal_Icon} alt="" className="h-10 w-10" />
                  <span>{actionType}</span>
                </div>
                <IconButton
                  onClick={onClose}
                  className="text-gray-400 !rounded-xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5 !px-2"
                  title=""
                >
                  <Icon name="close" size="small" className="pl-0.5" />
                </IconButton>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">
                  {amount}{" "}
                  {actionType == "Deposit" || actionType == "Withdraw"
                    ? asset.symbol
                    : `Q${asset.symbol}`}
                </h3>
                <div className="glass rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                  <span className="text-gray-400">Asset</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={asset.logoUrl}
                      alt={asset.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>
                      {actionType == "Deposit" || actionType == "Withdraw"
                        ? asset.symbol
                        : `Q${asset.symbol}`}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={submitTransaction}
                disabled={currentAction != null}
                className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
              >
                {currentAction == null ? (
                  `Confirm ${actionType}`
                ) : (
                  <span>{currentAction}</span>
                )}
              </Button>
            </>
          ) : (
            <div className="flex flex-col justify-items-center">
              <div className="flex justify-between items-center">
                <div />
                <IconButton
                  onClick={onClose}
                  className="text-gray-400 !rounded-xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5 !px-2"
                  title=""
                >
                  <Icon name="close" size="small" className="pl-1" />
                </IconButton>
              </div>
              <div className="flex flex-col items-center space-y-3">
                {txError ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Icon
                        name="times circle"
                        size="large"
                        color="red"
                        className="pl-1"
                      />
                    </div>
                    <h2 className="text-xl font-semibold">{txError}</h2>
                    <Button
                      type="button"
                      onClick={onClose}
                      className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
                    >
                      Try Again
                    </Button>
                  </>
                ) : (
                  <>
                    <img src={Marketing_Campaign_1} alt="" />
                    <h2>
                      {referenceAmount}{" "}
                      {actionType == "Deposit" || actionType == "Withdraw"
                        ? asset.symbol
                        : `Q${asset.symbol}`}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {actionType} Successful
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal.Content>
      </Modal>
    );
  }
);
