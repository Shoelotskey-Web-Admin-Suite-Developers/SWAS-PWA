import '@/App.css'
import '@/index.css'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import SRM from '@/pages/srm'
import Operations from '@/pages/operations/operations';
import Payment from '@/pages/operations/payment';
import CentralView from '@/pages/database-view/CentralView';
import CustomerInformation from '@/pages/database-view/CustomerInformation';
import Branches from '@/pages/database-view/Branches';
import Analytics from '@/pages/analytics/analytics'
import Appointments from '@/pages/user-management/appointments'
import Announcements from '@/pages/user-management/announcements'

function App() {
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
  >('serviceRequest')

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar stays fixed at the top */}
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
  )
}


export default App
