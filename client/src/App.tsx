import '@/App.css'
import '@/index.css'
import swasLogo from '@/assets/images/SWAS-Logo-Small.png'
import NotifIcon from '@/components/icons/NotifIcon';



function App() {

  return (
    <>
      <div className='navBar'>
        <div className='navBar-contents'>
          <div className='navBar-contents-p1'>
            <img src={swasLogo} alt="SWAS Logo" />
            <div className='nav-BranchName'><h2>Branch Name</h2></div>
            <a href=""><h2 className='regular'>Log Out</h2></a>
          </div>
          <div className='navBar-contents-p2'>
            <ul>
              <li><a href=""><h3>Service Request</h3></a></li>
              <li><a href=""><h3>Operations</h3></a></li>
              <li><a href=""><h3>Database View</h3></a></li>
              <li><a href=""><h3>Analytics</h3></a></li>
              <li><a href=""><h3>User Management</h3></a></li>
              <li><a href=""><NotifIcon /></a>
                </li>
            </ul>
          </div>
          <div className='navBar-contents-p2-mobile'>
            asdasdasd
          </div>
        </div>
          <svg width="100%" height="7">
            <line x1="0" y1="5" x2="100%" y2="5" stroke="#797979" strokeWidth="3" strokeDasharray="13 8" />
          </svg>
      </div>

      <div className='mainContent'>
        {/* This is the main content */}
      </div>

    </>
  )
}


export default App
