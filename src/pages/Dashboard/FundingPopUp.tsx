import { useAgent, useAuth } from "@nfid/identitykit/react";
import { Asset } from "../../lists/marketlist";
import { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { LiquidityManagerActor } from "../../utils/Interfaces/liquidityManagerActor";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { Modal, Button, Icon } from "semantic-ui-react";
import Modal_Icon from "../../images/Modal_Icon.png";
import Marketing_Campaign_1 from "../../images/Marketing_Campaign_1.png";
import { SECOND } from "../../utils/constants";
import { IconButton } from "../../components/Navbar";

interface Props {
  asset: Asset;
  isOpen: boolean;
  readAgent: HttpAgent;
  onClose: () => void;
}

export default function FundingPopUp({
  readAgent,
  asset,
  isOpen,
  onClose,
}: Props) {
  const readWriteAgent = useAgent();
  const { user } = useAuth();
  const [userTokenBalance, setUserTokenBalance] = useState<bigint>(0n);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [error, setError] = useState<
    "Insufficient Balance" | "Amount too Small" | null
  >(null);
  const [currentAction, setCurrentAction] = useState<
    "Appoving..." | "Depositing..." | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [view, setView] = useState<"input" | "preview" | "transaction result">(
    "input"
  );

  const [txError, setTxError] = useState<string | null>(null);

  const [transactionDone, setTransactionDone] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (readWriteAgent && asset.vaultID) {
      setUserBalance();
      interval = setInterval(() => {
        setUserBalance();
      }, 5 * SECOND);
    } else {
      setUserTokenBalance(0n);
    }
    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

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
      // setUserBalance();
      // setView("input");
      // setDepositAmount("");
      // setError("");
      // setCurrentAction("");
      // setIsChecked(false);
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
    // if (depositAmount !== "" && error === "") {
    // Calculate dollar value based on current market rate (mock)
    //setDollarValue((parseFloat(depositAmount) * 450).toFixed(2));
    setView("preview");
    //  setError("");
    //}
  };

  const goBackToInput = (e: React.MouseEvent) => {
    e.preventDefault();
    setView("input");
    // setUserBalance();
    // setDepositAmount("");
    // setError("");
    // setCurrentAction("");
    setTxError(null);
    setIsChecked(false);
  };

  const onAmountUpdate = (value: string) => {
    if (Number(value) < 0) return;
    setDepositAmount(value);
    if (value == "") {
      setError(null);
    } else {
      const amount = parseUnits(value, asset.decimals).toBigInt();
      setError(
        amount > userTokenBalance
          ? "Insufficient Balance"
          : amount <= 0n
          ? "Amount too Small"
          : null
      );
    }
  };

  /// Canister Interaction fucntions

  /**
   *
   * Balance management fetches user balance for the parituclar asset and returns it
   */

  const setUserBalance = async () => {
    try {
      let tokenActor = new TokenActor(asset.canisterID, readAgent);
      const balance = await tokenActor.balance(user.principal);
      setUserTokenBalance(balance);
    } catch {
      alert("fetched tokenbalance with error");
      return;
    }
  };

  const approveSpending = async (approvalAmount: bigint): Promise<boolean> => {
    let { vaultID } = asset;

    let tokenActor = new TokenActor(asset.canisterID, readWriteAgent);

    return tokenActor.approveSpending(
      approvalAmount,
      Principal.fromText(vaultID)
    );
    //return txResult;
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID } = asset;

    let tokenActor = new TokenActor(asset.canisterID, readAgent);

    return tokenActor.allowance(user.principal, Principal.fromText(vaultID));
  };

  const fundAccount = async (e: React.MouseEvent) => {
    e.preventDefault();
    let { vaultID } = asset;
    // setTxError("");
    try {
      if (readWriteAgent && vaultID) {
        setIsLoading(true);
        const allowance = await getCurrentAllowance();
        let amount = parseUnits(depositAmount, asset.decimals).toBigInt();
        if (allowance < amount) {
          setCurrentAction("Appoving...");
          let response = await approveSpending(amount - allowance);
          if (!response) {
            setTxError("Approval failed");
            setTransactionDone(true);
            return;
          }
        }
        let vaultActor = new LiquidityManagerActor(
          asset.vaultID,
          readWriteAgent
        );
        setCurrentAction("Depositing...");
        let txResult = await vaultActor.fundAccount(amount, user.principal);
        if (!txResult) {
          setTxError("Funding Account failed");
        }
      } else {
        return;
      }
    } catch (err) {
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
      className="!bg-[#0A1022]/90 !backdrop-blur-xl !rounded-3xl !border !border-white/10 !p-0"
    >
      <Modal.Content className="!bg-transparent !text-white !p-5 space-y-5">
        {view === "input" && (
          <>
            <div className="!flex justify-between content-center items-center mb-5 !bg-transparent !text-white">
              <div className="text-xl font-bold flex items-center gap-2 w-full">
                <img src={Modal_Icon} alt="" className="h-10 w-10" />
                <span>Deposit</span>
              </div>
              <IconButton
                onClick={onClose}
                className="text-gray-400 !rounded-xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5 !px-2"
                title=""
              >
                <Icon name="close" size="small" className="pl-0.5" />
              </IconButton>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Cryptocurrency
                </label>
                <div className="glass rounded-xl border border-white/10 bg-white/5 p-3 flex items-center">
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
                <div className="glass rounded-xl border border-white/10 bg-white/5 p-3">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => onAmountUpdate(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent border-none focus:outline-none text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="text-sm text-white flex justify-between mt-3">
                    <span className="text-white">
                      Balance:{" "}
                      <span className="text-xs">
                        {formatUnits(userTokenBalance, asset.decimals)}{" "}
                        {asset.symbol}
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
                    deposit service.
                  </span>
                </label>
              </div>
              <Button
                type="button"
                onClick={proceedToPreview}
                disabled={error !== null || depositAmount === "" || !isChecked}
                className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full !border !border-[#c2c0c0] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition-all duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50"
              >
                Deposit
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
              <span className="text-xl font-bold">Funding Preview</span>
            </div>

            <div className="text-center pt-5">
              <h2 className="text-3xl font-bold mb-2">
                {depositAmount} {asset.symbol}
              </h2>
              {/* <p className="text-gray-400">
                You will deposit{" "}
                <span className="text-green-600">${dollarValue}</span>
              </p> */}

              <div className="my-8 py-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Deposit</span>
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
              type="button"
              onClick={fundAccount}
              disabled={isLoading}
              className={`!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full !border !border-[#c2c0c0] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition-all duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50
                ${
                  isLoading
                    ? "bg-[#0300ad5c] text-gray-400 cursor-not-allowed"
                    : "bg-[#0300ad] hover:bg-[#0000003d] text-white"
                }
              `}
            >
              {isLoading ? <span>{currentAction}</span> : "Deposit"}
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
              {txError !== null ? (
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
                    {depositAmount} {asset.symbol}
                  </h2>
                  <p className="text-sm text-gray-400">Deposit Successful</p>
                </>
              )}
            </div>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
}
