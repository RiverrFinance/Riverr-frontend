import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './Dashboard/pages/Dashboard';
import { Trade } from './Dashboard/pages/Trade';
import { Earn } from './Dashboard/pages/Earn';
import { Support } from './Dashboard/pages/Support';
import { Leaderboard } from './Dashboard/pages/Leaderboard';
import { Sidebar } from './Dashboard/components/Sidebar';
import { Toaster } from 'sonner';
import 'semantic-ui-css/semantic.min.css';
// import '../styles/sonner.css';

function App() {
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
          <Route path="/support" element={<Support />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
}

export default App;
