import React, { useState, useEffect } from 'react';
import { Modal, Icon, Button } from 'semantic-ui-react';
import { Asset } from '../../lists/marketlist';
import { IconButton } from '../../components/Sidebar';
import Modal_Icon from "../../images/Modal_Icon.png";
import Marketing_Campaign_1 from "../../images/Marketing_Campaign_1.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'Deposit' | 'Withdraw' | 'Stake' | 'Unstake';
  asset: Asset;
  userBalance: bigint;
  amount: string;
  error: string;
  onSubmitTransaction: () => Promise<void>;
  isLoading: boolean;
  txError: string;
  currentAction: 'Appoving' | 'Transacting' | '';
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  actionType,
  asset,
  amount,
  error,
  onSubmitTransaction,
  isLoading,
  txError,
  currentAction,
}) => {
  const [view, setView] = useState<'preview' | 'result'>('preview');

  useEffect(() => {
    if (!isOpen) setView('preview');
  }, [isOpen]);

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      size="tiny"
      className="!bg-[#141416] p-5 !rounded-3xl"
    >
      <Modal.Content className="!bg-transparent !text-white space-y-5">
        {view === 'preview' ? (
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
                {amount} {asset.symbol}
              </h3>
              <div className="flex items-center justify-between p-4 bg-[#1C1C28] rounded-lg">
                <span className="text-gray-400">Asset</span>
                <div className="flex items-center gap-2">
                  <img src={asset.logoUrl} alt={asset.name} className="w-5 h-5 rounded-full" />
                  <span>{asset.name}</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={onSubmitTransaction}
              disabled={isLoading}
              className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
            >
              {isLoading ? (
                <span>
                  {currentAction === "Appoving"
                    ? "Approving..."
                    : "Processing..."}
                </span>
              ) : (
                `Confirm ${actionType}`
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
                    onClick={() => setView('preview')}
                    className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <img src={Marketing_Campaign_1} alt="" />
                  <h2>
                    {amount} {asset.symbol}
                  </h2>
                  <p className="text-sm text-gray-400">{actionType} Successful</p>
                </>
              )}
            </div>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};
