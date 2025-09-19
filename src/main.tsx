import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LaserEyesProvider, TESTNET4 } from "@omnisat/lasereyes";
import { SiwbIdentityProvider } from "ic-siwb-lasereyes-connector";
// import { SiwbIdentityProvider } from 'ic-use-siwb-identity';
import type { _SERVICE as siwbService } from "./idls/ic_siwb_provider.d.ts";
import { idlFactory as siwbIdl } from "./idls/ic_siwb_provider.idl.ts";
import { Network } from "lucide-react";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <LaserEyesProvider config={{ network: TESTNET4 }}>
    <SiwbIdentityProvider<siwbService>
      canisterId={"be2us-64aaa-aaaaa-qaabq-cai"}
      idlFactory={siwbIdl}
      httpAgentOptions={{
        host: "https://icp0.io",
      }}
    >
      <App />
    </SiwbIdentityProvider>
  </LaserEyesProvider>
  // {/* </StrictMode> */}
);
