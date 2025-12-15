import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function KioskLayout(){
  return (
    <div className="role-root">
      <nav className="role-nav">
        <NavLink to="/kiosk" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Kiosk</NavLink>
      </nav>
      <section className="role-content">
        <Outlet />
      </section>
    </div>
  )
}
