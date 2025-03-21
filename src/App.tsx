import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Trade } from "./pages/Trade/Trade";
import { Earn } from "./pages/Earn";
import { Support } from "./pages/Support";
import { Sidebar } from "semantic-ui-react";
import { Toaster } from "sonner";
import "semantic-ui-css/semantic.min.css";
import { useState } from "react";
import { Identity } from "@dfinity/agent";
// import '../styles/sonner.css';

function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
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
          <Route
            path="/"
            element={
              <Dashboard
                Identity={identity}
                setIdentity={(id: Identity) => {
                  setIdentity(id);
                }}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                Identity={identity}
                setIdentity={(id: Identity) => {
                  setIdentity(id);
                }}
              />
            }
          />
          <Route
            path="/trade"
            element={
              <Trade
                Identity={identity}
                setIdentity={(id: Identity) => {
                  setIdentity(id);
                }}
              />
            }
          />
          <Route
            path="/earn"
            element={
              <Earn
                Identity={identity}
                setIdentity={(id: Identity) => {
                  setIdentity(id);
                }}
              />
            }
          />
          <Route
            path="/support"
            element={
              <Support
                Identity={identity}
                setIdentity={(id: Identity) => {
                  setIdentity(id);
                }}
              />
            }
          />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
}

export default App;
