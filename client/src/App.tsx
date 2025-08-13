import '@/App.css'
import '@/index.css'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import SRM from '@/pages/srm'

function App() {
  const [activePage, setActivePage] = useState<'serviceRequest' | 'home' | 'other'>('home')

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <div className='mainContent'>
        {activePage === 'serviceRequest' ? <SRM /> : <SRM />}
      </div>
    </>
  )
}

export default App
