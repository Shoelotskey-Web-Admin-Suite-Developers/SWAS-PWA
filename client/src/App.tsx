import '@/App.css';
import '@/index.css';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SRM from '@/pages/srm';
import Operations from '@/pages/operations/operations';
import Payment from '@/pages/operations/payment';
import CentralView from '@/pages/database-view/CentralView';
import CustomerInformation from '@/pages/database-view/CustomerInformation';
import Branches from '@/pages/database-view/Branches';
import Analytics from '@/pages/analytics/analytics';
import Appointments from '@/pages/user-management/appointments';
import Announcements from '@/pages/user-management/announcements';
import Login from '@/pages/auth/login';

function App() {
  // ───────────── STATES ─────────────
  const [activePage, setActivePage] = useState<
    | 'serviceRequest'
    | 'operations'
    | 'payment'
    | 'central-view'
    | 'customer-information'
    | 'branches'
    | 'analytics'
    | 'appointments'
    | 'announcements'
  >('serviceRequest');

  const [user, setUser] = useState<{
    user_id: string;
    branch_id: string;
    position: string;
  } | null>(null);

  // ───────────── AUTO-LOGIN ─────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user_id = localStorage.getItem('user_id');
      const branch_id = localStorage.getItem('branch_id');
      const position = localStorage.getItem('position');

      if (user_id && branch_id && position) {
        setUser({ user_id, branch_id, position });
      } else {
        // Token exists but info missing → logout
        localStorage.clear();
      }
    }
  }, []);

  // ───────────── CONDITIONAL RENDER ─────────────
  if (!user) return <Login />; // show login if not logged in

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar stays fixed */}
      <div className="shrink-0">
        <Navbar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Main content scrolls independently */}
      <div className="flex-1 overflow-y-auto">
        {activePage === 'serviceRequest' && <SRM />}
        {activePage === 'operations' && <Operations />}
        {activePage === 'payment' && <Payment />}
        {activePage === 'central-view' && <CentralView />}
        {activePage === 'customer-information' && <CustomerInformation />}
        {activePage === 'branches' && <Branches />}
        {activePage === 'analytics' && <Analytics />}
        {activePage === 'appointments' && <Appointments />}
        {activePage === 'announcements' && <Announcements />}
      </div>
    </div>
  );
}

export default App;
