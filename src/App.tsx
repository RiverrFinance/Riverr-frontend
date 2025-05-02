import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Trade } from "./pages/Trade/Trade";
import { Earn } from "./pages/Earn/Earn";
import { Sidebar } from "./components/Sidebar";
import { Toaster } from "sonner";
import "semantic-ui-css/semantic.min.css";
import "@nfid/identitykit/react/styles.css";
import {
  IdentityKitProvider,
  useAgent,
  useAuth,
} from "@nfid/identitykit/react";
import { useEffect } from "react";

// import '../styles/sonner.css';

function App() {
  console.log("app mounting");
  return (
    <IdentityKitProvider authType="ACCOUNTS">
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
          <Route path="/" element={<Trade />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/earn" element={<Earn />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
};

export default App;
