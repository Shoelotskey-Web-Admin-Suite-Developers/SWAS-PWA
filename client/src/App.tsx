import '@/App.css'
import '@/index.css'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import SRM from '@/pages/srm'
import Operations from '@/pages/operations/operations';
import Payment from '@/pages/operations/payment';
import CentralView from '@/pages/database-view/CentralView';

function App() {
  const [activePage, setActivePage] = useState<'serviceRequest' | 'operations' | 'payment' | 'central-view'>('serviceRequest')

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <div className='mainContent'>
        {activePage === 'serviceRequest' && <SRM />}
        {activePage === 'operations' && <Operations />}
        {activePage === 'payment' && <Payment />}
        {activePage === 'central-view' && <CentralView />}
      </div>
    </>
  )
}

export default App
