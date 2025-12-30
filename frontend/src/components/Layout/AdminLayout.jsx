import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout(){
  return (
    <div className="role-root">
      <nav className="role-nav">
        <NavLink to="/admin/analytics" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Analytics</NavLink>
        <NavLink to="/admin/hosts" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Hosts</NavLink>
        <NavLink to="/admin/receptionists" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Receptionists</NavLink>
      </nav>
      <section className="role-content">
        <Outlet />
      </section>
    </div>
  )
}
