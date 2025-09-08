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
  const [activePage, setActivePage] = useState<'serviceRequest' | 'operations' | 'payment' | 'central-view'  | 'customer-information' | 'branches' | 'analytics' | 'appointments' | 'announcements'>('serviceRequest')

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <div className='mainContent'>
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
    </>
  )
}

export default App
