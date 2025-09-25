import React, { useState } from "react";
import { Modal, Icon } from "semantic-ui-react";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useSiwbIdentity } from "ic-siwb-lasereyes-connector";
import { TESTNET4, UNISAT, WIZZ, XVERSE } from "@omnisat/lasereyes";
import { toast } from "sonner";
import { IconButton } from "../../components/Navbar";

// Wallet logos - using commonly available URLs
const WALLET_LOGOS = {
  unisat: "https://next-cdn.unisat.io/_/2025-v1555/logo/color.svg",
  wizz: "https://wizzwallet.io/images/wizz_logo.svg",
  xverse:
    "https://cdn.prod.website-files.com/624b08d53d7ac60ccfc11d8d/645d01e85e0969992e9e4caa_Full_Logo.webp",
};

// Wallet download links
const WALLET_DOWNLOAD_LINKS = {
  unisat:
    "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
  wizz: "https://wizzwallet.io/",
  xverse:
    "https://chromewebstore.google.com/detail/xverse-bitcoin-crypto-wal/idnnbdplmphpflfnlkomgpfbpcgelopg?hl=en-GB&authuser=0&pli=1",
};

type WalletType = "unisat" | "wizz" | "xverse";

interface WalletInfo {
  name: string;
  logo: string;
  downloadLink: string;
  isInstalled: boolean;
  walletConstant: any;
}

interface BitcoinConnectModalProps {
  open: boolean;
  onClose: () => void;
}

export const BitcoinConnectModal: React.FC<BitcoinConnectModalProps> = ({
  open,
  onClose,
}) => {
  const [connecting, setConnecting] = useState<WalletType | null>(null);

  const { setLaserEyes } = useSiwbIdentity();
  const p = useLaserEyes();
  const { hasUnisat, hasWizz, hasXverse, network, switchNetwork } = useLaserEyes();

  const wallets: Record<WalletType, WalletInfo> = {
    unisat: {
      name: "UniSat",
      logo: WALLET_LOGOS.unisat,
      downloadLink: WALLET_DOWNLOAD_LINKS.unisat,
      isInstalled: hasUnisat,
      walletConstant: UNISAT
    },
    wizz: {
      name: "Wizz Wallet",
      logo: WALLET_LOGOS.wizz,
      downloadLink: WALLET_DOWNLOAD_LINKS.wizz,
      isInstalled: hasWizz,
      walletConstant: WIZZ,
    },
    xverse: {
      name: "Xverse",
      logo: WALLET_LOGOS.xverse,
      downloadLink: WALLET_DOWNLOAD_LINKS.xverse,
      isInstalled: hasXverse,
      walletConstant: XVERSE,
    },
  };

  const connectWallet = async (walletType: WalletType) => {
    const wallet = wallets[walletType];

    if (!wallet.isInstalled) {
      toast.error(`${wallet.name} not installed`, {
        description: "Please install the wallet extension first",
        duration: 3000,
      });
      return;
    }

    setConnecting(walletType);

    try {
      // Connect to the wallet
      await setLaserEyes(p, wallet.walletConstant);

      if (network !== TESTNET4) {
        await switchNetwork(TESTNET4);
      }

      toast.success(`Connected to ${wallet.name}!`, {
        duration: 3000,
      });

      onClose();
    } catch (error) {
      console.error(`${wallet.name} connection error:`, error);
      toast.error(`Failed to connect to ${wallet.name}`, {
        description: error.message || "Connection failed",
        duration: 4000,
      });
    } finally {
      setConnecting(null);
    }
  };

  const openDownloadLink = (walletType: WalletType) => {
    window.open(wallets[walletType].downloadLink, "_blank");
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setConnecting(null);
      }}
      size="tiny"
      className="!bg-[#0A1022]/90 !backdrop-blur-xl !rounded-3xl !border !border-white/10 !p-0"
    >
      <Modal.Content className="!bg-transparent !text-white !p-5 space-y-5">
        <div className="!flex justify-between content-center items-center mb-5 !bg-transparent !text-white">
          <div className="text-xl font-bold flex items-center gap-2 w-full">
            <img
              src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1696501408"
              alt=""
              className="h-10 w-10"
            />
            <span>Connect Bitcoin Wallet</span>
          </div>
          <IconButton
            onClick={() => {
              onClose();
              setConnecting(null);
            }}
            className="text-gray-400 !rounded-xl hover:text-white hover:!translate-x-0 hover:-translate-y-0.5 hover:!shadow-[0_2px_0_0_#0300AD] !p-1.5 !px-2"
            title=""
          >
            <Icon name="close" size="small" className="pl-0.5" />
          </IconButton>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-4">
              Choose a wallet to connect to the Bitcoin network
            </label>

            {Object.entries(wallets).map(([key, wallet]) => (
              <div
                key={key}
                className={`glass rounded-xl border border-white/10 bg-white/5 p-4 mb-3 cursor-pointer transition-all duration-200
                  ${
                    wallet.isInstalled
                      ? "hover:border-[#0300AD]/60 hover:bg-white/10"
                      : "opacity-60"
                  }`}
                onClick={() =>
                  wallet.isInstalled
                    ? connectWallet(key as WalletType)
                    : openDownloadLink(key as WalletType)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <img
                        src={wallet.logo}
                        alt={wallet.name}
                        className="w-6 h-6 rounded-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-medium text-base capitalize">
                        {wallet.name}
                      </span>
                      <span
                        className={`text-xs ${
                          wallet.isInstalled
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      >
                        {wallet.isInstalled
                          ? "Ready to connect"
                          : "Click to install extension"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {connecting === key && (
                      <Icon name="spinner" loading className="text-[#0300AD]" />
                    )}

                    {wallet.isInstalled ? (
                      <Icon name="chevron right" className="text-gray-400" />
                    ) : (
                      <Icon name="download" className="text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl border border-white/10 bg-white/5 p-3 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Icon name="info circle" />
              <span>Make sure you're connecting to Bitcoin Testnet4</span>
            </div>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
};
