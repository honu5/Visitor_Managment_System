import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function HostLayout(){
  return (
    <div>
      <nav style={{position:'fixed',top:28,right:28,display:'flex',gap:8,zIndex:10000}}>
        <NavLink to="/host" end className={({isActive})=> isActive? 'nav-active':'nav-item'}>Home</NavLink>
        <NavLink to="/host/pending" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Pending</NavLink>
        <NavLink to="/host/schedule" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Schedule</NavLink>
        <NavLink to="/host/notifications" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Notifications</NavLink>
        <NavLink to="/host/history" className={({isActive})=> isActive? 'nav-active':'nav-item'}>History</NavLink>
      </nav>

      <section className="role-content" style={{paddingTop:72}}>
        <Outlet />
      </section>
    </div>
  )
}
