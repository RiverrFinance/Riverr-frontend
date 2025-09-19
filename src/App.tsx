import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Trade } from "./pages/Trade/Trade";
import { Earn } from "./pages/Earn/Earn";
import { Sidebar } from "./components/Sidebar";
import { Toaster } from "sonner";
import "semantic-ui-css/semantic.min.css";
import "@nfid/identitykit/react/styles.css";
import { IdentityKitProvider } from "@nfid/identitykit/react";
import { NFIDW, InternetIdentity } from "@nfid/identitykit";
import Bitcoin from "./pages/Bitcoin/Bitcoin";

function App() {
  return (
    <IdentityKitProvider
      signers={[NFIDW]}
      authType="ACCOUNTS"
      windowOpenerFeatures="top=100px,left=1500rem,width=500px,height=600px"
    >
      <SubApp />
    </IdentityKitProvider>
  );
}

const SubApp = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="dark"
        className="sonner-toast"
      />
      <Sidebar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/bitcoin_integration" element={<Bitcoin />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
};

export default App;
