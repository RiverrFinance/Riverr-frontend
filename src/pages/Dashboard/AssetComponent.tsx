import React, { memo, useEffect, useMemo, useState } from "react";
import { Asset } from "../../lists/marketlist";
import { useAgent } from "@nfid/identitykit/react";
import { TokenActor } from "../../utils/Interfaces/tokenActor";
import { HttpAgent } from "@dfinity/agent";
import { Icon } from "semantic-ui-react";
import { IconButton } from "../../components/Sidebar";
import { formatEther, formatUnits } from "ethers/lib/utils";

const ICP_API_HOST = "https://icp-api.io/";

interface Props {
  price: number;
  asset: Asset;
  userBalance: string;
  index: number;
  openAccordionIndex: number;
  onAccordionToggle: (index: number) => void;
  onDeposit: (asset: Asset) => void;
  onWithdraw: (asset: Asset) => void;
}

export const AssetComponent = function AssetComponent({
  asset,
  price,
  userBalance,
  index,
  openAccordionIndex,
  onAccordionToggle,
  onDeposit,
  onWithdraw,
}: Props) {
  const isAccordionOpen = index === openAccordionIndex;
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1000);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        key={asset.name}
        className="
      col-span-12 grid grid-cols-12 items-center justify-between py-2 cursor-pointer"
        onClick={isMobileView ? () => onAccordionToggle(index) : undefined}
      >
        <div className="col-span-4 max-lg:col-span-6 flex items-center">
          <div className="mr-2">
            {asset.logoUrl && (
              <img
                src={asset.logoUrl}
                alt={asset.name}
                className="w-6 h-6 rounded-full"
              />
            )}
          </div>
          <div>
            <div className="text-md font-semibold capitalize">{asset.name}</div>
            <div className="text-sm text-gray-500">{asset.symbol}</div>
          </div>
        </div>
        <div className="col-span-2 max-lg:col-span-3 text-sm">
          ${formatPrice(price)}
        </div>
        <div className="col-span-2 max-lg:col-span-3 text-sm font-medium">
          {userBalance}
        </div>

        {!isMobileView && (
          <div className="col-span-4 flex justify-end gap-2">
            <IconButton
              onClick={() => onDeposit(asset)}
              title="Deposit"
              className="!bg-[#0300ad] hover:!bg-[#0000003d] text-white text-sm font-normal px-5 py-2 rounded-full flex items-center gap-2 justify-items-center border border-[#353434] hover:!-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
            >
              <Icon
                name="arrow down"
                color="grey"
                size="small"
                className="rotate-45"
              />
            </IconButton>
            <IconButton
              onClick={() => onWithdraw(asset)}
              title="Withdraw"
              className="bg-[#000000b3] hover:bg-[#0000003d] text-white text-sm font-normal px-5 py-2 rounded-full flex items-center gap-2 justify-items-center border border-[#4d4c4c] hover:!-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD]"
            >
              <Icon
                name="arrow up"
                color="grey"
                size="small"
                className="rotate-45"
              />
            </IconButton>
          </div>
        )}
      </div>

      {isMobileView && isAccordionOpen && (
        <div
          className={`col-span-12 mt-2 flex flex-col items-center justify-center transition-all duration-300 ${
            isAccordionOpen ? "animate-slideDown" : "animate-slideUp"
          }`}
        >
          <IconButton
            title="Deposit"
            onClick={() => {
              onAccordionToggle(index);
              onDeposit(asset);
            }}
            className="!bg-[#0300ad] hover:!bg-[#0000003d] text-white text-sm font-normal py-2 rounded-full flex items-center gap-2 justify-center w-full border border-[#353434] hover:!-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
          >
            <Icon
              name="arrow down"
              color="grey"
              size="small"
              className="rotate-45"
            />
          </IconButton>
          <IconButton
            title="Withdraw"
            onClick={() => {
              onAccordionToggle(index);
              onWithdraw(asset);
            }}
            className="bg-[#000000b3] hover:bg-[#0000003d] text-white text-sm font-normal py-2 rounded-full flex items-center gap-2 justify-center w-full border border-[#4d4c4c] mt-2 hover:!-translate-y-0.5 hover:shadow-[0_2px_0_0_#0300AD]"
          >
            <Icon
              name="arrow up"
              color="grey"
              size="small"
              className="rotate-45"
            />
          </IconButton>
        </div>
      )}
    </>
  );
};

const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return price < 1
    ? price.toFixed(6)
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};
