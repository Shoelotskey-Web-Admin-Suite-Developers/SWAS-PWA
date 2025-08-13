import React, { useState } from 'react'
import swasLogo from '@/assets/images/SWAS-Logo-Small.png'
import NotifIcon from '@/components/icons/NotifIcon'
import { useDropdownHandlers } from '@/hooks/useDropdownHandlers'

type NavbarProps = {
  activePage: 'serviceRequest' | 'home' | 'other'
  setActivePage: React.Dispatch<React.SetStateAction<'serviceRequest' | 'home' | 'other'>>
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  const [opDropdown, setOpDropdown] = useState(false)
  const [dbDropdown, setDbDropdown] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)

  const opDropdownHandlers = useDropdownHandlers(setOpDropdown)
  const dbDropdownHandlers = useDropdownHandlers(setDbDropdown)
  const userDropdownHandlers = useDropdownHandlers(setUserDropdown)

  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen(prev => !prev)

  return (
    <div className='navBar'>
      <div className='navBar-contents'>
        <div className='navBar-contents-p1'>
          <img src={swasLogo} alt="SWAS Logo" />
          <div className='nav-BranchName'><h2>Branch Name</h2></div>
          <a href=""><h2 className='regular'>Log Out</h2></a>
        </div>

        <div className='navBar-contents-p2'>
          <ul>
            <li>
              <a href="#" onClick={e => { e.preventDefault(); setActivePage('serviceRequest') }}>
                <h3>Service Request</h3>
              </a>
            </li>

            {/* Operations dropdown */}
            <li className={`dropdown ${opDropdown ? "dropdown-open" : ""}`}>
              <div {...opDropdownHandlers}>
                <h3>Operations</h3>
                {opDropdown && (
                  <div className="dropdown-menu">
                    <div className='dropdown-items'>
                      <div className='dropdown-item'><a href="">Operations</a></div>
                      <div className='dropdown-item'><a href="">Payment</a></div>
                    </div>
                  </div>
                )}
              </div>
            </li>

            {/* Database View dropdown */}
            <li className={`dropdown ${dbDropdown ? "dropdown-open" : ""}`}>
              <div {...dbDropdownHandlers}>
                <h3>Database View</h3>
                {dbDropdown && (
                  <div className="dropdown-menu">
                    <div className='dropdown-items'>
                      <div className='dropdown-item'><a href="">Central View</a></div>
                      <div className='dropdown-item'><a href="">Customer Information</a></div>
                      <div className='dropdown-item'><a href="">Branches</a></div>
                    </div>
                  </div>
                )}
              </div>
            </li>

            <li><a href=""><h3>Analytics</h3></a></li>

            {/* User Management dropdown */}
            <li className={`dropdown ${userDropdown ? "dropdown-open" : ""}`}>
              <div {...userDropdownHandlers}>
                <h3>User Management</h3>
                {userDropdown && (
                  <div className="dropdown-menu">
                    <div className='dropdown-items'>
                      <div className='dropdown-item'><a href="">Appointments</a></div>
                      <div className='dropdown-item'><a href="">Announcements</a></div>
                    </div>
                  </div>
                )}
              </div>
            </li>

            <li><a href=""><NotifIcon /></a></li>
          </ul>
        </div>

        {/* Tablet and Mobile nav simplified similarly (you can also break into smaller components if needed) */}

        {/* Tablet version */}
        <div className='navBar-contents-p2-tablet'>
          <div>
            <ul>
              <li><a href=""><h3>Service Request</h3></a></li>

              <li className={`dropdown ${opDropdown ? "dropdown-open" : ""}`}>
                <div {...opDropdownHandlers}>
                  <h3>Operations</h3>
                  {opDropdown && (
                    <div className="dropdown-menu">
                      <div className='dropdown-items'>
                        <div className='dropdown-item'><a href="">Operations</a></div>
                        <div className='dropdown-item'><a href="">Payment</a></div>
                      </div>
                    </div>
                  )}
                </div>
              </li>

              <li><a href=""><NotifIcon /></a></li>

              <li>
                <div className={`burger-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                </div>

                {isOpen && (
                  <div className="burger-dropdown">
                    <ul>
                      <li className={`dropdown ${dbDropdown ? "dropdown-open" : ""}`}>
                        <div onClick={() => setDbDropdown(prev => !prev)}>
                          <h3>Database View</h3>
                          {dbDropdown && (
                            <div className='dropdown-tablet'>
                              <a href="">Central View</a>
                              <a href="">Customer Information</a>
                              <a href="">Branches</a>
                            </div>
                          )}
                        </div>
                      </li>
                      <li><a href="#"><h3>Analytics</h3></a></li>
                      <li className={`dropdown ${userDropdown ? "dropdown-open" : ""}`}>
                        <div onClick={() => setUserDropdown(prev => !prev)}>
                          <h3>User Management</h3>
                          {userDropdown && (
                            <div className='dropdown-tablet'>
                              <a href="">Appointments</a>
                              <a href="">Announcements</a>
                            </div>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile version */}
        <div className='navBar-contents-p1-mobile'>
          <img src={swasLogo} alt="SWAS Logo" />
        </div>

        <div className='nav-BranchName-mobile'><h3>Branch Name</h3></div>

        <div className='navBar-contents-p2-mobile'>
          <ul>
            <li><a href=""><NotifIcon /></a></li>
            <li>
              <div className={`burger-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>

              {isOpen && (
                <div className="burger-dropdown">
                  <ul>
                    <li><a href=""><h3>Service Request</h3></a></li>

                    <li className={`dropdown ${opDropdown ? "dropdown-open" : ""}`}>
                      <div onClick={() => setOpDropdown(prev => !prev)}>
                        <h3>Operations</h3>
                        {opDropdown && (
                          <div className='dropdown-tablet'>
                            <a href="">Operations</a>
                            <a href="">Payment</a>
                          </div>
                        )}
                      </div>
                    </li>

                    <li className={`dropdown ${dbDropdown ? "dropdown-open" : ""}`}>
                      <div onClick={() => setDbDropdown(prev => !prev)}>
                        <h3>Database View</h3>
                        {dbDropdown && (
                          <div className='dropdown-tablet'>
                            <a href="">Central View</a>
                            <a href="">Customer Information</a>
                            <a href="">Branches</a>
                          </div>
                        )}
                      </div>
                    </li>

                    <li><a href="#"><h3>Analytics</h3></a></li>

                    <li className={`dropdown ${userDropdown ? "dropdown-open" : ""}`}>
                      <div onClick={() => setUserDropdown(prev => !prev)}>
                        <h3>User Management</h3>
                        {userDropdown && (
                          <div className='dropdown-tablet'>
                            <a href="">Appointments</a>
                            <a href="">Announcements</a>
                          </div>
                        )}
                      </div>
                    </li>

                    <li><a href="">Log Out</a></li>
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>

      <svg width="100%" height="7">
        <line x1="0" y1="5" x2="100%" y2="5" stroke="#797979" strokeWidth="3" strokeDasharray="13 8" />
      </svg>
    </div>
  )
}
