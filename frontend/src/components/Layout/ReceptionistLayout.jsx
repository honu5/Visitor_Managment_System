import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function ReceptionistLayout(){
  return (
    <div>
      <nav style={{position:'fixed',top:28,right:28,display:'flex',gap:8,zIndex:10000}}>
        <NavLink to="/receptionist" end className={({isActive})=> isActive? 'nav-active':'nav-item'}>Home</NavLink>
        <NavLink to="/receptionist/visitors" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Visitors</NavLink>
        <NavLink to="/receptionist/history" className={({isActive})=> isActive? 'nav-active':'nav-item'}>History</NavLink>
        <NavLink to="/receptionist/notifications" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Notifications</NavLink>
      </nav>

      <section className="role-content" style={{paddingTop:72}}>
        <Outlet />
      </section>
    </div>
  )
}
