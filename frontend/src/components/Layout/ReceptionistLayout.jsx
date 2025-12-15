import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function ReceptionistLayout(){
  return (
    <div className="role-root">
      <nav className="role-nav">
        <NavLink to="/receptionist/hosts" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Hosts</NavLink>
        <NavLink to="/receptionist/visitors" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Visitors</NavLink>
        <NavLink to="/receptionist/notifications" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Notifications</NavLink>
      </nav>
      <section className="role-content">
        <Outlet />
      </section>
    </div>
  )
}
