import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

import VisitorAppointments from './pages/Visitor/Appointments'
import VisitorHostList from './pages/Visitor/HostList'
import VisitorHistory from './pages/Visitor/History'
import VisitorNotifications from './pages/Visitor/Notifications'

import KioskHome from './pages/Kiosk/KioskHome'

import HostHome from './pages/Host/Home'
import HostSchedule from './pages/Host/Schedule'
import HostPending from './pages/Host/Pending'
import HostAppoint from './pages/Host/Appoint'
import HostHistory from './pages/Host/History'
import HostNotifications from './pages/Host/Notifications'

import ReceptionistHosts from './pages/Receptionist/HostsDashboard'
import ReceptionistVisitors from './pages/Receptionist/Visitors'
import ReceptionistNotifications from './pages/Receptionist/Notifications'

import AdminHosts from './pages/Admin/Hosts'
import AdminReceptionists from './pages/Admin/Receptionists'
import AdminVisitors from './pages/Admin/Visitors'
import AdminAnalytics from './pages/Admin/Analytics'

import VisitorLayout from './components/Layout/VisitorLayout'
import HostLayout from './components/Layout/HostLayout'
import ReceptionistLayout from './components/Layout/ReceptionistLayout'
import AdminLayout from './components/Layout/AdminLayout'
import KioskLayout from './components/Layout/KioskLayout'
import './styles.css'

export default function App(){
  return (
    <div className="app-root">
      <header className="topbar">
        <h1><Link to="/visitor/appointment" style={{color:'#fff',textDecoration:'none'}}>Visitor Management</Link></h1>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<div>Welcome to Visitor Management</div>} />

          <Route path="/visitor/*" element={<VisitorLayout/>}>
            <Route path="appointments" element={<VisitorHostList/>} />
            <Route path="appointment" element={<VisitorAppointments/>} />
            <Route path="history" element={<VisitorHistory/>} />
            <Route path="notifications" element={<VisitorNotifications/>} />
            <Route index element={<VisitorHostList/>} />
          </Route>

          <Route path="/kiosk/*" element={<KioskLayout/>}>
            <Route path="" element={<KioskHome/>} />
          </Route>

          <Route path="/host/*" element={<HostLayout/>}>
            <Route index element={<HostHome/>} />
            <Route path="schedule" element={<HostSchedule/>} />
            <Route path="pending" element={<HostPending/>} />
            <Route path="appoint" element={<HostAppoint/>} />
            <Route path="history" element={<HostHistory/>} />
            <Route path="notifications" element={<HostNotifications/>} />
          </Route>

          <Route path="/receptionist/*" element={<ReceptionistLayout/>}>
            <Route path="hosts" element={<ReceptionistHosts/>} />
            <Route path="visitors" element={<ReceptionistVisitors/>} />
            <Route path="notifications" element={<ReceptionistNotifications/>} />
          </Route>

          <Route path="/admin/*" element={<AdminLayout/>}>
            <Route path="hosts" element={<AdminHosts/>} />
            <Route path="receptionists" element={<AdminReceptionists/>} />
            <Route path="visitors" element={<AdminVisitors/>} />
            <Route path="analytics" element={<AdminAnalytics/>} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}
