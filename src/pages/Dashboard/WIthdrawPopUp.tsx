import { useAgent, useAuth } from "@nfid/identitykit/react";
import React, { useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { parseUnits } from "ethers/lib/utils";
import { Modal, Button, Icon } from "semantic-ui-react";
import { IconButton } from "../../components/Sidebar";
import Modal_Icon from "../../images/Modal_Icon.png";
import Marketing_Campaign_1 from "../../images/Marketing_Campaign_1.png";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  marginBalance: string;
}

export default function WithdrawPopUp({
  asset,
  isOpen,
  onClose,
  marginBalance,
}: Props) {
  const readWriteAgent = useAgent();
  const { user } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [error, setError] = useState<
    "Insufficient Balance" | "Amount too Small" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [view, setView] = useState<"input" | "preview" | "transaction result">(
    "input"
  );
  const [txError, setTxError] = useState<string | null>(null);

  const [transactionDone, setTransactionDone] = useState(false);

  useEffect(() => {
    if (transactionDone) {
      setView("transaction result");
      setTransactionDone(false);
    }
  }, [transactionDone]);

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const proceedToPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    // if (withdrawAmount !== "" && error === "") { you disables thw button if this conditions are not met so no need to include them here
    // Calculate dollar value based on current market rate (mock)
    //  setDollarValue((parseFloat(withdrawAmount) * 450).toFixed(2));
    setView("preview");
    //}
  };

  const goBackToInput = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsChecked(false);
    setTxError(null);
    setView("input");
  };

  const onAmountChange = (value: string) => {
    if (Number(value) < 0) return;
    setWithdrawAmount(value);
    if (value == "") {
      setError(null);
    } else {
      const amount = parseUnits(value, asset.decimals).toBigInt();

      if (amount > parseUnits(marginBalance, asset.decimals).toBigInt()) {
        setError("Insufficient Balance");
      } else if (amount <= 0n) {
        setError("Amount too Small");
      } else {
        setError(null);
      }
    }
  };

  const withdrawFromAccount = async (e: React.MouseEvent) => {
    try {
      if (readWriteAgent) {
        setIsLoading(true);
        const vaultActor = new VaultActor(asset.vaultID, readWriteAgent);
        const amount = parseUnits(withdrawAmount, asset.decimals).toBigInt();
        let txResult: boolean = await vaultActor.withdrawfromAccount(
          amount,
          user.principal
        );
        console.log(txResult);
        if (!txResult) {
          setTxError("Transaction failed. Please try again.");
        }
      } else {
        return;
      }
    } catch (error) {
      setTxError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
    setTransactionDone(true);
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="tiny"
      className="!bg-[#141416] p-5 !rounded-3xl"
    >
      <Modal.Content className="!bg-transparent !text-white space-y-5">
        {view === "input" && (
          <>
            <div className="!flex justify-between content-center items-center mb-5 !bg-transparent !text-white">
              <div className="text-xl font-bold flex items-center gap-2 w-full">
                <img src={Modal_Icon} alt="" className="h-10 w-10" />
                <span>Withdraw</span>
              </div>
              <IconButton
                onClick={onClose}
                className="text-gray-400 !rounded-xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5 !px-2"
                title=""
              >
                <Icon name="close" size="small" className="pl-0.5" />
              </IconButton>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Cryptocurrency
                </label>
                <div className="bg-[#18191D] p-3 rounded-lg flex items-center">
                  {asset.logoUrl && (
                    <img
                      src={asset.logoUrl}
                      alt={asset.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <div>
                    <span className="font-medium capitalize">{asset.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {asset.symbol}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount
                </label>
                <div className="bg-[#18191D] p-3 rounded-lg">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent border-none focus:outline-none text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="text-sm text-white flex justify-between mt-2">
                    <span className="text-white">
                      Available:{" "}
                      <span className="text-xs">
                        {marginBalance} {asset.symbol}
                      </span>
                    </span>
                    {error && <span className="text-red-500">{error}</span>}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#23262F]"
                    onChange={() => setIsChecked(!isChecked)}
                  />

                  <span className="text-sm text-gray-500">
                    I agree with the terms and conditions of the platform's
                    withdrawal service.
                  </span>
                </label>
              </div>

              <Button
                onClick={proceedToPreview}
                disabled={error !== null || withdrawAmount === "" || !isChecked}
                className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full !border !border-[#c2c0c0] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition-all duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
              >
                Withdraw
              </Button>
            </div>
          </>
        )}
        {view === "preview" && (
          <>
            <div className="flex items-center justify-items-center mb-5">
              <button
                title="arrow left"
                type="button"
                onClick={goBackToInput}
                className="text-gray-400 hover:text-white mr-3"
              >
                <Icon name="arrow left" />
              </button>
              <span className="text-xl font-bold">Withdrawal Preview</span>
            </div>

            <div className="text-center pt-5">
              <h2 className="text-3xl font-bold mb-2">
                {withdrawAmount} {asset.symbol}
              </h2>
              {/* <p className="text-gray-400">
                You will withdraw{" "}
                <span className="text-green-600">${dollarValue}</span>
              </p> */}

              <div className="my-8 py-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Withdraw</span>
                  <span className="font-semibold flex items-center capitalize">
                    {asset.logoUrl && (
                      <img
                        src={asset.logoUrl}
                        alt={asset.name}
                        className="w-4 h-4 rounded-full mr-1"
                      />
                    )}
                    {asset.name}{" "}
                    <span className="text-gray-400 ml-1 text-xs">
                      {asset.symbol}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={withdrawFromAccount}
              disabled={isLoading}
              className={`!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full !border !border-[#c2c0c0] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition-all duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50
                ${
                  isLoading
                    ? "bg-[#0300ad5c] text-gray-400 cursor-not-allowed"
                    : "bg-[#0300ad] hover:bg-[#0000003d] text-white"
                }
              `}
            >
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>
          </>
        )}

        {view === "transaction result" && (
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
              {txError != null ? (
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
                  {/* <p className="text-sm text-gray-400">{txError}</p> */}
                  <Button
                    onClick={goBackToInput}
                    className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full !border !border-[#c2c0c0] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition-all duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <img src={Marketing_Campaign_1} alt="" />
                  <h2>
                    {withdrawAmount} {asset.symbol}
                  </h2>
                  <p className="text-sm text-gray-400">Withdrawal Successful</p>
                </>
              )}
            </div>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
}
