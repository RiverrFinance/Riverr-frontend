import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './Dashboard/pages/Dashboard';
import { Trade } from './Dashboard/pages/Trade';
import { Earn } from './Dashboard/pages/Earn';
import { Support } from './Dashboard/pages/Support';
import { Leaderboard } from './Dashboard/pages/Leaderboard';
import { Sidebar } from './Dashboard/components/Sidebar';
import { Toaster } from 'sonner';
import 'semantic-ui-css/semantic.min.css';
import { useState } from 'react';
import { Identity } from '@dfinity/agent';
// import '../styles/sonner.css';

function App() {

  const [identity,setIdentity]= useState<Identity | null>(null)
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
          <Route path="/" element={<Dashboard  Identity={identity} setIdentity={(id:Identity)=>{setIdentity(id)}}/>} />
          <Route path="/dashboard" element={<Dashboard Identity={identity} setIdentity={(id:Identity)=>{setIdentity(id)}}/>} />
          <Route path="/trade" element={<Trade Identity={identity} setIdentity={(id:Identity)=>{setIdentity(id)}}/>} />
          <Route path="/earn" element={<Earn Identity={identity} setIdentity={(id:Identity)=>{setIdentity(id)}} />} />
          <Route path="/support" element={<Support Identity={identity} setIdentity={(id:Identity)=>{setIdentity(id)}} />} />
          <Route path="/leaderboard" element={<Leaderboard Identity={identity} setIdentity={(id:Identity)=>{setIdentity(id)}} />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
}

export default App;
