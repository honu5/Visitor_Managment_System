import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

import VisitorAppointments from './pages/Visitor/Appointments'
import VisitorHistory from './pages/Visitor/History'
import VisitorNotifications from './pages/Visitor/Notifications'

import KioskHome from './pages/Kiosk/KioskHome'

import HostSchedule from './pages/Host/Schedule'
import HostHistory from './pages/Host/History'
import HostNotifications from './pages/Host/Notifications'

import ReceptionistHosts from './pages/Receptionist/HostsDashboard'
import ReceptionistVisitors from './pages/Receptionist/Visitors'
import ReceptionistNotifications from './pages/Receptionist/Notifications'

import AdminHosts from './pages/Admin/Hosts'
import AdminReceptionists from './pages/Admin/Receptionists'
import AdminVisitors from './pages/Admin/Visitors'
import AdminAnalytics from './pages/Admin/Analytics'

import './styles.css'

export default function App(){
  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Visitor Management</h1>
        <nav>
          <Link to="/visitor/appointments">Visitor</Link> |
          <Link to="/kiosk">Kiosk</Link> |
          <Link to="/host/schedule">Host</Link> |
          <Link to="/receptionist/hosts">Receptionist</Link> |
          <Link to="/admin/hosts">Admin</Link>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<div>Welcome to Visitor Management</div>} />

          <Route path="/visitor/appointments" element={<VisitorAppointments/>} />
          <Route path="/visitor/history" element={<VisitorHistory/>} />
          <Route path="/visitor/notifications" element={<VisitorNotifications/>} />

          <Route path="/kiosk" element={<KioskHome/>} />

          <Route path="/host/schedule" element={<HostSchedule/>} />
          <Route path="/host/history" element={<HostHistory/>} />
          <Route path="/host/notifications" element={<HostNotifications/>} />

          <Route path="/receptionist/hosts" element={<ReceptionistHosts/>} />
          <Route path="/receptionist/visitors" element={<ReceptionistVisitors/>} />
          <Route path="/receptionist/notifications" element={<ReceptionistNotifications/>} />

          <Route path="/admin/hosts" element={<AdminHosts/>} />
          <Route path="/admin/receptionists" element={<AdminReceptionists/>} />
          <Route path="/admin/visitors" element={<AdminVisitors/>} />
          <Route path="/admin/analytics" element={<AdminAnalytics/>} />
        </Routes>
      </main>
    </div>
  )
}
