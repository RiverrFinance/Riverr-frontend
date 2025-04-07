import { useAgent } from "@nfid/identitykit/react";
import { Asset } from "../../lists/marketlist";
import { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Principal } from "@dfinity/principal";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { parseUnits } from "ethers/lib/utils";
import { Modal, Button, Icon } from "semantic-ui-react";
import { IconButton } from "../../components/Sidebar";
import Modal_Icon from "../../../public/images/Modal_Icon.png"
import Marketing_Campaign_1 from "../../../public/images/Marketing_Campaign_1.png"

const ICP_API_HOST = "https://icp-api.io/";

interface Props {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

export default function FundingPopUp({ asset, isOpen, onClose }: Props) {
  const readWriteAgent = useAgent();
  const [userTokenBalance, setUserTokenBalance] = useState<bigint>(0n);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [error, setError] = useState<
    "" | "Insufficient Balance" | "Amount too Small"
  >("");
  const [currentAction, setCurrentAction] = useState<
    "Appoving" | "Spending" | ""
  >("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [view, setView] = useState<"input" | "preview" | "success">("input");
  const [dollarValue, setDollarValue] = useState<string>("0.00");

  const setUserBalance = async () => {
    try {
      if (readWriteAgent) {
        let user = await readWriteAgent.getPrincipal();
        let tokenActor = new TokenActor(asset.canisterID, readAgent);
        const balance = await tokenActor.balance(user);
        setUserTokenBalance(balance);
      }
    } catch (err) {}
  };

  const approveSpending = async (
    approvalAmount: bigint,
    expectedAmount: bigint
  ): Promise<boolean> => {
    let { vaultID } = asset;
    try {
      if (readWriteAgent && vaultID) {
        let tokenActor = new TokenActor(asset.canisterID, readWriteAgent);

        let txResult = await tokenActor.approveSpending(
          approvalAmount,
          expectedAmount,
          Principal.fromText(vaultID)
        );
        return txResult;
      }
    } catch {
      return false;
    }
  };

  const getCurrentAllowance = async (): Promise<bigint> => {
    let { vaultID } = asset;
    try {
      let user = await readWriteAgent.getPrincipal();
      let tokenActor = new TokenActor(asset.canisterID, readAgent);

      return await tokenActor.allowance(user, Principal.fromText(vaultID));
    } catch {
      return 0n;
    }
  };

  const proceedToPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (depositAmount !== "" && error === "") {
      // Calculate dollar value based on current market rate (mock)
      setDollarValue((parseFloat(depositAmount) * 450).toFixed(2));
      setView("preview");
    }
  };

  const goBackToInput = (e: React.MouseEvent) => {
    e.preventDefault();
    setView("input");
  };

  const fundAccount = async (e: React.MouseEvent) => {
    // e.preventDefault();
    // let { vaultID } = asset;
    try {
    //   if (readWriteAgent && depositAmount !== "" && vaultID) {
    //     setIsLoading(true);
    //     let user = await readWriteAgent.getPrincipal();

    //     const allowance = await getCurrentAllowance();

    //     let amount = parseUnits(depositAmount, asset.decimals).toBigInt();

    //     if (allowance < amount) {
    //       setCurrentAction("Appoving");
    //       let response = await approveSpending(amount - allowance, amount);
    //       if (!response) {
    //         setIsLoading(false);
    //         return;
    //       }
    //     }

    //     let vaultActor = new VaultActor(asset.vaultID, readWriteAgent);
    //     setCurrentAction("Spending");

    //     let txResult = await vaultActor.fundAccount(amount, user);
        
        // Show success message
        setView("success");
        setIsLoading(false);
      // }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const onAmountUpdate = (value: string) => {
    if (value !== "") {
    //   setError("");
    // } else {
    //   const amount = parseUnits(value, asset.decimals);
    //   if (amount.toBigInt() > userTokenBalance) {
    //     setError("Insufficient Balance");
    //   } else {
    //     setError("");
    //   }
    }
    setDepositAmount(value);
  };

  const formatBalance = (balance: bigint) => {
    return Number(balance) / Math.pow(10, asset.decimals);
  };

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
      
      HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
      setUserBalance();
      setView("input");
      setDepositAmount("");
      setError("");
      setCurrentAction("");
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, asset]);

  if (!isOpen) return null;

  return (  
    <Modal open={isOpen} onClose={onClose} size="tiny" className="!bg-[#141416] p-5 !rounded-3xl">
      <Modal.Content className="!bg-transparent !text-white space-y-5">
        {view === "input" && (
          <>
            <div className="!flex justify-between content-center items-center mb-5 !bg-transparent !text-white">
              <div className="text-xl font-bold flex items-center gap-2 w-full">
                <img src={Modal_Icon} alt="" className="h-10 w-10" />
                <span>Deposit</span>
              </div>
              <IconButton onClick={onClose} className="text-gray-400 !rounded-2xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5" title="">
                <Icon name="close" size="small" className="pl-0.5" />
              </IconButton>
            </div>  
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Cryptocurrency</label>
                <div className="bg-[#18191D] p-3 rounded-lg flex items-center">
                  {asset.logoUrl && (
                    <img src={asset.logoUrl} alt={asset.name} className="w-6 h-6 rounded-full mr-2" />
                  )}
                  <div>
                    <span className="font-medium capitalize">{asset.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{asset.symbol}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                <div className="bg-[#18191D] p-3 rounded-lg">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => onAmountUpdate(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent border-none focus:outline-none text-xl"
                  />
                  <div className="text-sm text-gray-400 flex justify-between mt-2">
                    <span className="text-white">Balance: <span className="text-xs text-gray-400">{formatBalance(userTokenBalance)} {asset.symbol}</span></span>
                    {error && <span className="text-red-500">{error}</span>}
                  </div>                
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#23262F]" onChange={() => setIsChecked(!isChecked)} />
                  <span className="text-sm text-gray-500">
                    I agree with the terms and conditions of the platform's deposit service.
                  </span>
                </label>
              </div>
              <Button type="button" onClick={proceedToPreview} disabled={error !== "" || depositAmount === "" || !isChecked} className="!bg-[#0300ad] hover:!bg-[#0000003d] !text-white !text-sm !font-normal !py-3 !rounded-full !flex !items-center !gap-2 !justify-center !w-full !border !border-[#c2c0c0] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] overflow-hidden transition-all duration-500 bg-transparent hover:border-t hover:border-b hover:border-blue-400/50" >
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
              <span className="text-xl font-bold">Order Preview</span>
            </div>
            
            <div className="text-center pt-5">
              <h2 className="text-3xl font-bold mb-2">
                {depositAmount} {asset.symbol}
              </h2>
              <p className="text-gray-400">You will deposit <span className="text-green-600">${dollarValue}</span></p>
              
              <div className="my-8 py-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Deposit</span>
                  <span className="font-semibold flex items-center capitalize">
                    {asset.logoUrl && <img src={asset.logoUrl} alt={asset.name} className="w-4 h-4 rounded-full mr-1" />}
                    {asset.name} <span className="text-gray-400 ml-1 text-xs">{asset.symbol}</span>
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
              {isLoading ? (
                <span>
                  {currentAction === "Appoving" ? "Approving..." : "Depositing..."}
                </span>
              ) : (
                "Deposit"
              )}
            </Button>
          </>
        )}
        {view === "success" && (
          <div className="flex flex-col justify-items-center">
            <div className="flex justify-between items-center">
              <div />
              <IconButton onClick={onClose} className="text-gray-400 !rounded-2xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5" title="">
                <Icon name="close" size="small" className="pl-0.5" />
              </IconButton>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <img src={Marketing_Campaign_1} alt="" />
              <h2>{depositAmount} {asset.symbol}</h2>
              <p className="text-sm text-gray-400">Deposit Successful</p>               
            </div>

          </div>
        )}
      </Modal.Content>
    </Modal>
  );
}
