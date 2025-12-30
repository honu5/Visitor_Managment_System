import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function VisitorLayout(){
  return (
    <div>
      <nav style={{position:'fixed',top:28,right:28,display:'flex',gap:8,zIndex:10000}}>
        <NavLink to="/visitor/home" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Home</NavLink>
        <NavLink to="/visitor/history" className={({isActive})=> isActive? 'nav-active':'nav-item'}>History</NavLink>
        <NavLink to="/visitor/notifications" className={({isActive})=> isActive? 'nav-active':'nav-item'}>Notifications</NavLink>
      </nav>
      <div className="role-content" style={{paddingTop:72}}>
        <Outlet />
      </div>
    </div>
  )
}
