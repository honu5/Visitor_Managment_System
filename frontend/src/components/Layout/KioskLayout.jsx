import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function KioskLayout(){
  return (
    <div className="role-root kiosk">
      <section className="role-content">
        <Outlet />
      </section>
    </div>
  )
}
