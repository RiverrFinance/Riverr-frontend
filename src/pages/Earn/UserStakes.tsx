import { Agent, HttpAgent } from "@dfinity/agent";
import { Asset } from "../../lists/marketlist";
import { useEffect, useState } from "react";
import { StakeDetails } from "../../utils/declarations/vault/vault.did";
import { useAuth } from "@nfid/identitykit/react";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import { TransactionModal } from "./TransactionModal";
import { formatUnits } from "ethers/lib/utils";
import Stake from "./Stake";
import { SECOND } from "../../utils/constants";

interface UserStakesProps {
  selectedAsset: Asset;
  readWriteAgent: Agent | undefined;
  readAgent: HttpAgent;
}

export const UserStakes = ({
  selectedAsset,
  readWriteAgent,
  readAgent,
}: UserStakesProps) => {
  let { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<"Processing..." | null>(
    null
  );
  const [userStakes, setUserStakes] = useState<
    Array<[bigint, StakeDetails, bigint]>
  >([]);
  const [index, setReferenceIndex] = useState<number | null>(null);
  const [referenceAmount, setReferenceAmount] = useState<bigint>(0n);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (readWriteAgent) {
      fetchSetUserStakes();
      interval = setInterval(() => {
        fetchSetUserStakes();
      }, 10 * SECOND);
    } else {
      setUserStakes([]);
    }

    return () => {
      clearInterval(interval);
    };
  }, [readWriteAgent]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTxError(null);
  };

  const handleModalOpen = (index: number) => {
    setReferenceIndex(index);
    setIsModalOpen(true);
  };

  const handleUnstakeTransaction = async () => {
    await unStakeVirtualTokens();
  };

  const fetchSetUserStakes = async () => {
    const { vaultID } = selectedAsset;

    try {
      let vaultActor = new VaultActor(vaultID, readAgent);

      const stakes: [bigint, StakeDetails, bigint][] =
        await vaultActor.getUserStakes(user.principal);
      setUserStakes(stakes);
    } catch {
      return;
    }
  };

  const unStakeVirtualTokens = async () => {
    let { vaultID } = selectedAsset;

    setCurrentAction("Processing...");

    try {
      let id: bigint = userStakes[index][0];
      let vaultactor = new VaultActor(vaultID, readWriteAgent);
      let txResult = await vaultactor.unstakeVirtualToken(id);

      if (!txResult) {
        setTxError("Unstaking transaction failed.");
        setCurrentAction(null);
        return;
      }
    } catch (e) {
      setTxError(`Error: ${e.message || "An unknown error occurred."}`);
    } finally {
      setCurrentAction(null);
      setReferenceIndex(null);
    }
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 lg:p-6 border-2 border-dashed border-[#363c52] border-opacity-40 min-h-10 h-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Stakes</h2>
      {userStakes.length === 0 ? (
        <div className="text-center text-gray-400 py-6">No stakes</div>
      ) : (
        userStakes.map((userStake) => {
          const [id, stake, feesEarned] = userStake;
          const index: number = userStakes.indexOf(userStake);
          return (
            <div key={id} className="mb-4">
              <Stake
                unStake={() => {
                  handleModalOpen(index);
                  setReferenceAmount(stake.amount);
                }}
                id={id}
                stake={stake}
                feesEarned={`${formatUnits(
                  feesEarned,
                  selectedAsset.decimals
                )} Q${selectedAsset.symbol}`}
              />
            </div>
          );
        })
      )}
      <TransactionModal
        isOpen={isModalOpen}
        onModalClose={handleModalClose}
        actionType={"Unlock"}
        asset={selectedAsset}
        amount={`${formatUnits(referenceAmount, selectedAsset.decimals)}`}
        onSubmitTransaction={handleUnstakeTransaction}
        txError={txError}
        currentAction={currentAction}
      />
    </div>
  );
};
