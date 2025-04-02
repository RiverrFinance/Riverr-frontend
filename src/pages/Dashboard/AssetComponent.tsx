import { memo, useEffect, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { useAgent } from "@nfid/identitykit/react";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { HttpAgent } from "@dfinity/agent";
import { Icon } from "semantic-ui-react";

const ICP_API_HOST = "https://icp-api.io/";

interface Props {
  price: number;
  asset: Asset;
  userBalance: string;
  openDepositModal: (asset: Asset) => void; 
  openWithdrawModal: (asset: Asset) => void;
  
}

export const AssetComponent = memo(function AssetComponent({
  asset,
  price,
  userBalance,
  openDepositModal,
  openWithdrawModal
}: Props) {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

 
  const value = price * Number(userBalance);

  return (
    <div key={asset.name} className="grid grid-cols-12 items-center justify-between py-2">
      <div className="col-span-4 flex items-center">
        <div className="mr-2">
          {/* {asset.logo}  */}
        </div>
        <div>
          <div className="text-sm font-semibold capitalize">{asset.name}</div>
          <div className="text-xs text-gray-500">{asset.symbol}</div>
        </div>
      </div>
      <div className="col-span-2 text-sm">
        ${formatPrice(Number(userBalance))}
      </div>
      <div className="col-span-2 text-sm font-medium">
        ${formatPrice(value)}
      </div>
      <div className="col-span-4  flex justify-end gap-2">
        <button
          type="button"
          onClick={() => openDepositModal(asset)}
          className="bg-[#0300AD] hover:bg-[#0300ad7f] text-white text-xs font-normal px-10 py-2 rounded-full"
        >
          <Icon name="level down alternate" />
          Deposit
        </button>
        <button
          type="button"
          onClick={() => openWithdrawModal(asset)}
          className="bg-[#000000b3] hover:bg-[#0000003d] text-white text-xs font-normal px-10 py-2 rounded-full"
        >
          Withdraw
        </button>
      </div>
    </div>
//   <div className="flex items-center justify-between py-3">
//   <div className="w-1/3 flex items-center">
//     {/* {asset.logoUrl && <img src={asset.logoUrl} alt={asset.name} className="w-6 h-6 mr-2 rounded-full" />} */}
//     <div>
//       <div className="text-sm font-semibold">{asset.name}</div>
//       <div className="text-xs text-gray-500">{asset.symbol}</div>
//     </div>
//   </div>
//   <div className="w-1/3 text-right">{userBalance}</div>
//   <div className="w-1/3 text-right">${formatPrice(value)}</div>
  // <div className="w-1/3 text-right flex justify-end gap-2">
  //   <button
  //     type="button"
  //     onClick={() => openDepositModal(asset)}
  //     className="bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded"
  //   >
  //     Deposit
  //   </button>
  //   <button
  //     type="button"
  //     onClick={() => openWithdrawModal(asset)}
  //     className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded"
  //   >
  //     Withdraw
  //   </button>
  // </div>
// </div>
  );
});
{/* <div>the price is {formatPrice(price)} the userBalance</div> */}


const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
