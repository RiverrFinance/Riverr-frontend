import React, { useEffect, useRef, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { BitcoinActionButton } from "./BitcoinActionButton";
import { ConnectBTCWalletButton } from "./BitcoinWalletButton";
import { toast } from "sonner";
import { assetList } from "../../lists/marketlist";
import { useSiwbIdentity } from "ic-siwb-lasereyes-connector";
import {
  TESTNET4,
  UNISAT,
  useLaserEyes,
  WIZZ,
  XVERSE,
} from "@omnisat/lasereyes";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { Agent, HttpAgent } from "@dfinity/agent";
import { ICP_API_HOST } from "../../utils/constants";
import { CKBTCMinterActor } from "../../utils/Interfaces/mintckBTCActor";
import { Principal } from "@dfinity/principal";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { data } from "react-router-dom";
// for deposit BTC
/// if change is amount in ,just check for if balance is sufficient and update the amount out
/// if change is amount_out ,get the requireed amount in and check for sufficiency in deposit balance
///
async function propAgent(): Promise<Agent> {
  let new_identity = Ed25519KeyIdentity.generate();

  let agent = await HttpAgent.create({
    identity: new_identity,
  });

  return agent;
}
const ckBTC_MINTER_CANISTER_ID = "ml52i-qqaaa-aaaar-qaaba-cai";
const BTC_IMAGE_URL =
  "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1696501408";

type MetaData = {
  symbol: "BTC" | "ckBTC";
  logoUrl: string;
};

const BTC_META_DATA: MetaData = {
  symbol: "BTC",
  logoUrl: BTC_IMAGE_URL,
};

const CKBTC_META_DATA: MetaData = {
  symbol: "ckBTC",
  logoUrl: assetList[2].logoUrl,
};

export default function BitcoinckBTCBridge() {
  const PendingTxInterval = useRef<NodeJS.Timeout | null>(null);
  const readWriteAgent = useAgent();
  const { user } = useAuth();
  const p = useLaserEyes();

  const {
    sendBTC,
    getBalance: getBTCBalance,
    address: btcAddress,
    network,
    switchNetwork,
    hasUnisat,
    hasWizz,
    hasXverse,
    connected,
  } = useLaserEyes();

  const { setLaserEyes } = useSiwbIdentity();
  const [readAgent, setReadAgent] = useState<Agent | undefined>(undefined);
  const [hasPendingTx, setHasPendingTx] = useState<boolean>(false);
  const [mode, setMode] = useState<"depositBTC" | "withdrawBTC">("depositBTC");
  const [error, setError] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<{
    amountIn: string;
    amountOut: string;
  }>({ amountIn: "", amountOut: "" });

  const [tokenStateMetaDate, setTokenStateMetaDate] = useState<{
    sendingToken: MetaData;
    receivingToken: MetaData;
  }>({ sendingToken: BTC_META_DATA, receivingToken: CKBTC_META_DATA });

  const [btcBalance, setBtcBalance] = useState<bigint>(0n);
  const [ckBTCBalance, setckBTCBalance] = useState<bigint>(0n);
  const [depositFee, setDepositFee] = useState<bigint>(0n);
  const [withdrawalFee, setWithdrawalFee] = useState<{
    minter_fee: bigint;
    bitcoin_fee: bigint;
  }>({
    minter_fee: 0n,
    bitcoin_fee: 0n,
  });

  const ckBTCMinterReadActor = new CKBTCMinterActor(
    ckBTC_MINTER_CANISTER_ID,
    readAgent
  );

  const ckBTCMinterWriteActor = new CKBTCMinterActor(
    ckBTC_MINTER_CANISTER_ID,
    readWriteAgent
  );

  // const connectBitcoinWallet = async () => {
  //   if (hasUnisat) {
  //     await setLaserEyes(p, UNISAT);
  //   } else if (hasWizz) {
  //     await setLaserEyes(p, WIZZ);
  //   } else if (hasXverse) {
  //     await setLaserEyes(p, XVERSE);
  //   }

  //   if (network !== TESTNET4) {
  //     await switchNetwork(TESTNET4);
  //   }
  // };

  const handleSetDepositFee = async () => {
    try {
      let fee = await ckBTCMinterReadActor.getDepositFee();
      setDepositFee(fee);
    } catch (error) {
      console.error(error);
    }
  };

  const balanceCheckCallback = () => {
    let totalFee =
      mode === "depositBTC"
        ? depositFee
        : withdrawalFee.minter_fee + withdrawalFee.bitcoin_fee;

    let balance = mode === "depositBTC" ? btcBalance : ckBTCBalance;

    let amountIn = parseUnits(
      amounts.amountIn == "" ? "0" : amounts.amountIn,
      8
    ).toBigInt();
    if (balance < amountIn + totalFee) {
      setError("Insufficient Balance");
    } else {
      setError(null);
    }
  };

  const handleAmountsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmounts({ amountIn: value, amountOut: value });
  };

  const handleSetWithdrawalFee = async (amount: bigint) => {
    let fee = await ckBTCMinterReadActor.getWithdrawalFeeEstimate(amount);
    setWithdrawalFee(fee);
  };

  const handleSwitchMode = () => {
    // Switch tokens
    setTokenStateMetaDate({
      sendingToken: tokenStateMetaDate.receivingToken,
      receivingToken: tokenStateMetaDate.sendingToken,
    });

    setMode(mode === "depositBTC" ? "withdrawBTC" : "depositBTC");
  };

  const getBalance = (token: "BTC" | "ckBTC"): string => {
    return token === "BTC"
      ? formatUnits(btcBalance, 8)
      : formatUnits(ckBTCBalance, 8);
  };

  const setBTCBalances = async () => {
    const balance = await getBTCBalance();
    setBtcBalance(balance == "" ? 0n : BigInt(balance));
  };

  const setckBTCBalances = async () => {
    const tokenActor = new TokenActor(assetList[2].canisterID, readAgent);
    const balance = await tokenActor.balance(user.principal);
    setckBTCBalance(balance);
  };

  useEffect(() => {
    if (mode == "withdrawBTC") {
      handleSetWithdrawalFee(
        parseUnits(
          amounts.amountIn == "" ? "0" : amounts.amountIn,
          8
        ).toBigInt()
      );
    } else {
      handleSetDepositFee(); // redundant as it can be called once
    }
  }, [amounts, mode]);

  useEffect(() => {
    balanceCheckCallback();
  }, [amounts, withdrawalFee, depositFee]);

  useEffect(() => {
    handleSetDepositFee();
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  useEffect(() => {
    if (!connected) {
      setBtcBalance(0n);
      return;
    }
    setBTCBalances();
    const id = setInterval(() => {
      setBTCBalances();
    }, 60000); // 1 minute
    return () => {
      clearInterval(id);
    };
  }, [connected]);

  useEffect(() => {
    if (readWriteAgent == undefined) {
      setckBTCBalance(0n);
      return;
    }
    setckBTCBalances();
    const id = setInterval(() => {
      setckBTCBalances();
    }, 60000); // 1 minute
    return () => {
      clearInterval(id);
    };
  }, [readWriteAgent]);

  useEffect(() => {
    if (hasPendingTx == false) {
      clearInterval(PendingTxInterval.current);
    }
  }, [hasPendingTx]);

  const polling = async ({
    isDeposit,
    blockIndex,
  }: {
    isDeposit: boolean;
    tx_hash?: string;
    blockIndex?: bigint;
  }) => {
    try {
      let updateResponse;
      if (isDeposit) {
        updateResponse = await fetch("/api/ckbtc/update-balance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            principal: user.principal,
            subaccount: null,
          }),
        });
      } else {
        updateResponse = await fetch(`/api/ckbtc/status/${blockIndex}`);
        const statusData = await updateResponse.json();
      }

      const updateData = await updateResponse.json();

      if (updateData.status == "pending") {
        return;
      } else {
        setHasPendingTx(false);
        await setBTCBalances();
        await setckBTCBalances();
        if (updateData.status === "success") {
          toast.dismiss("pending-tx");
          toast.success(
            `Transaction Successful 
          `,
            {
              duration: 5000,
            }
          );

          return;
        } else if (updateData.status === "failure") {
          //   console.log("✅ ckBTC Minting Success:", updateData.data);
          toast.dismiss("pending-tx");

          toast.error(`Transaction Failed`, {
            duration: 5000,
          });
          return;
        }
      }
    } catch (pollError) {
      console.error("❌ Polling error:", pollError);
    }
  };

  const handleBTCDepositTx = async (amount: bigint) => {
    try {
      if (mode === "depositBTC") {
        // Show processing toast
        const loadingToast = toast.loading("Initiating Bitcoin deposit...", {
          duration: Infinity,
        });

        try {
          // Get deposit address using existing actor
          let propActor = new CKBTCMinterActor(
            ckBTC_MINTER_CANISTER_ID,
            await propAgent()
          );
          let depositAddress = await propActor.getBTCAddress(user.principal);

          // Update toast
          toast.dismiss(loadingToast);
          toast.loading("Sending Bitcoin transaction...", {
            duration: Infinity,
            id: "btc-tx",
          });

          // Send BTC transaction
          let tx_hash = await sendBTC(depositAddress, Number(amount));

          setHasPendingTx(false);

          PendingTxInterval.current = setInterval(() => {
            polling({ isDeposit: true, tx_hash: tx_hash });
          }, 10000); // ten second

          setHasPendingTx(true);

          setAmounts({ amountIn: "", amountOut: "" });

          // Update toast
          toast.dismiss("btc-tx");
          toast.loading("Waiting for Bitcoin confirmation...", {
            duration: Infinity,
            id: "pending-tx",
          });
        } catch (error) {
          toast.dismiss(loadingToast);
          toast.dismiss("btc-tx");
          toast.dismiss("pending-tx");

          toast.error("Deposit failed", {
            description: error.message || "Failed to process Bitcoin deposit",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      toast.error("Deposit failed", {
        description: error.message || "Failed to process Bitcoin deposit",
        duration: 5000,
      });
    }
  };

  const handleBTCWithdrawalTx = async (amount: bigint) => {
    try {
      let tokenActor = new TokenActor(assetList[2].canisterID, readWriteAgent);

      toast.loading("Approving ckBTC spending...", {
        duration: Infinity,
        id: "approve-tx",
      });

      let approval_tx = await tokenActor.approveSpending(
        BigInt(amount),
        Principal.fromText(ckBTC_MINTER_CANISTER_ID)
      );

      toast.dismiss("approve-tx");
      if (approval_tx) {
        toast.loading("Processing withdrawal...", {
          duration: Infinity,
          id: "withdraw-tx",
        });

        let result = await ckBTCMinterWriteActor.retrieveBTCWithApproval(
          btcAddress,
          BigInt(amount)
        );

        toast.dismiss("withdraw-tx");
        if ("Ok" in result) {
          let blockIndex = result.Ok.block_index;

          toast.loading("Waiting for Bitcoin network confirmation...", {
            duration: Infinity,
            id: "pending-tx",
          });
        } else {
          toast.error("Withdrawal failed", {
            description: result.Err.toString(),
            duration: 5000,
          });
        }
      } else {
        toast.error("Withdrawal failed", {
          description: "Token approval failed",
          duration: 5000,
        });
      }
    } catch (error) {
      toast.dismiss("approve-tx");
      toast.dismiss("withdraw-tx");
      toast.dismiss("pending-tx");

      toast.error("Withdrawal failed", {
        description: error.message || "Failed to process ckBTC withdrawal",
        duration: 5000,
      });
    }
  };

  const handleTx = () => {
    if (amounts.amountIn == "" || amounts.amountIn == "0") {
      return;
    }

    let amount = parseUnits(amounts.amountIn, 8).toBigInt();
    if (mode === "depositBTC") {
      amount += depositFee;

      handleBTCDepositTx(amount);
    } else {
      amount += withdrawalFee.minter_fee + withdrawalFee.bitcoin_fee;
      handleBTCWithdrawalTx(amount);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full lg:px-4">
      <div className="w-full max-w-[480px] p-4">
        {/* Main Container */}
        <div className="w-full">
          {/* Header */}
          <div className="flex max-sm:flex-col justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              BTC/ckBTC Bridge
            </h2>
            <ConnectBTCWalletButton />
          </div>

          {/* Swap Container */}
          <div className="relative space-y-1">
            {/* Pay Input */}
            <div
              className={`relative rounded-3xl py-7 px-5 max-sm:py-5 max-sm:px-4 bg-[#12131a] transition-all duration-200 cursor-pointer h-[140px] max-sm:h-[120px] overflow-hidden
                ${
                  mode === "depositBTC"
                    ? "border border-white/10 hover:border hover:border-[#0300AD]/60"
                    : "border border-[#363c52]/40 bg-[#363c52]/40"
                }`}
            >
              <div className="flex justify-between mb-1">
                <label className="text-lg max-sm:text-sm text-gray-400">
                  Send
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={amounts.amountIn}
                  onChange={handleAmountsChange}
                  placeholder="0"
                  className="flex-1 bg-transparent text-3xl max-sm:text-2xl font-medium text-white outline-none placeholder-gray-600"
                />
                <div className="flex items-center gap-2 bg-[#1a1b23] p-2 rounded-xl min-w-[100px] max-sm:min-w-[60px] justify-center">
                  <img
                    src={tokenStateMetaDate.sendingToken.logoUrl}
                    alt={tokenStateMetaDate.sendingToken.symbol}
                    className="w-6 h-6 max-sm:w-4 max-sm:h-4 rounded-full object-contain"
                  />
                  <span className="text-base max-sm:text-sm  font-medium text-white">
                    {tokenStateMetaDate.sendingToken.symbol}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm max-sm:text-xs text-gray-500">
                  Available:{" "}
                  {getBalance(tokenStateMetaDate.sendingToken.symbol)}{" "}
                  {tokenStateMetaDate.sendingToken.symbol}
                </span>
              </div>
            </div>

            {/* Switch Button */}
            <button
              title="Switch Pay and Receive"
              type="button"
              onClick={handleSwitchMode}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#1a1b23] hover:bg-[#2c2d3d] transition-all duration-200 rounded-lg p-2 border border-[#ffffff]/10"
            >
              <ArrowDownUp size={26} className="text-white" />
            </button>

            {/* Receive Input */}
            <div
              className={`relative rounded-3xl py-7 px-5 max-sm:py-5 max-sm:px-4 bg-[#12131a] transition-all duration-200 cursor-pointer h-[140px] max-sm:h-[120px] overflow-hidden
                ${
                  mode === "withdrawBTC"
                    ? "border border-white/10 hover:border hover:border-[#0300AD]/60"
                    : "border border-[#363c52]/40 bg-[#363c52]/40"
                }`}
            >
              <div className="flex justify-between mb-1">
                <label className="text-lg max-sm:text-sm text-gray-400">
                  Receive
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={amounts.amountOut}
                  onChange={handleAmountsChange}
                  placeholder="0"
                  className="flex-1 bg-transparent text-3xl max-sm:text-2xl font-medium text-white outline-none placeholder-gray-600"
                />
                <div className="flex items-center gap-2 bg-[#1a1b23] p-2 rounded-xl min-w-[100px] max-sm:min-w-[60px]  justify-center">
                  <img
                    src={tokenStateMetaDate.receivingToken.logoUrl}
                    alt={tokenStateMetaDate.receivingToken.symbol}
                    className="w-6 h-6 max-sm:w-4 max-sm:h-4 rounded-full object-contain"
                  />
                  <span className="text-base max-sm:text-sm font-medium text-white">
                    {tokenStateMetaDate.receivingToken.symbol}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm max-sm:text-xs text-gray-500">
                  Available:{" "}
                  {getBalance(tokenStateMetaDate.receivingToken.symbol)}{" "}
                  {tokenStateMetaDate.receivingToken.symbol}
                </span>
              </div>
            </div>

            {/* Exchange Rate Info */}

            <div className="mt-4 p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Minter Fee</span>
                <span className="text-white">
                  {mode === "depositBTC"
                    ? formatUnits(depositFee, 8)
                    : formatUnits(withdrawalFee.minter_fee, 8)}{" "}
                  {tokenStateMetaDate.sendingToken.symbol}
                </span>
              </div>
              {mode === "withdrawBTC" && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Bitcoin Fee</span>
                  <span className="text-white">
                    {formatUnits(withdrawalFee.bitcoin_fee, 8)}{" "}
                    {tokenStateMetaDate.sendingToken.symbol}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-4 pt-5">
              {/* <button
                className="bg-[#0300AD] text-white py-2 px-4 rounded-lg"
                onClick={handleTx}
              >
                Connect Now
              </button> */}
              <BitcoinActionButton handleConfirm={handleTx} error={error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// type ConnecytBTCButtonProps = {
//   handleConnect: () => void;
// };
// const ConnectBTCWalletButton = ({ handleConnect }: ConnecytBTCButtonProps) => {
//   const { address, connected } = useLaserEyes();
//   return (
//     <button
//       type="button"
//       onClick={handleConnect}
//       className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] hover:from-[#0f3460] hover:to-[#1a1a2e] disabled:from-gray-600 disabled:to-gray-600/90 border border-[#0300AD]/30 shadow-lg hover:shadow-xl rounded-3xl flex items-center gap-2 px-4 py-4 cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
//     >
//       <img src={BTC_IMAGE_URL} alt="BTC" className="w-6 h-6 rounded-full" />
//       <span className="text-base font-semibold text-white">
//         {connected
//           ? address.slice(0, 6) + "..." + address.slice(-4)
//           : "Connect Bitcoin"}
//       </span>
//     </button>
//   );
// };
