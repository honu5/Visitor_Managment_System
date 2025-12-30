import React from 'react'
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'

import VisitorAppointments from './pages/Visitor/Appointments'
import VisitorHostList from './pages/Visitor/HostList'
import VisitorHistory from './pages/Visitor/History'
import VisitorNotifications from './pages/Visitor/Notifications'
import VisitorLogin from './pages/Visitor/Login'
import VisitorHome from './pages/Visitor/Home'

import KioskHome from './pages/Kiosk/KioskHome'
import KioskDepartments from './pages/Kiosk/Departments'
import KioskHosts from './pages/Kiosk/Hosts'
import KioskBook from './pages/Kiosk/Book'
import KioskCheckin from './pages/Kiosk/Checkin'
import KioskCheckout from './pages/Kiosk/Checkout'
import KioskStatus from './pages/Kiosk/Status'

import HostHome from './pages/Host/Home'
import HostSchedule from './pages/Host/Schedule'
import HostScheduleDay from './pages/Host/ScheduleDay'
import HostPending from './pages/Host/Pending'
import HostAppoint from './pages/Host/Appoint'
import HostHistory from './pages/Host/History'
import HostNotifications from './pages/Host/Notifications'
import HostSecratery from './pages/Host/Secratery'

import ReceptionistHosts from './pages/Receptionist/HostsDashboard'
import ReceptionistVisitors from './pages/Receptionist/Visitors'
import ReceptionistNotifications from './pages/Receptionist/Notifications'
import ReceptionistHome from './pages/Receptionist/Home'
import ReceptionistNextDay from './pages/Receptionist/NextDay'
import ReceptionistMake from './pages/Receptionist/MakeAppointment'
import ReceptionistHistory from './pages/Receptionist/History'

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
  const location = useLocation()
  const showKioskTopNav = location.pathname.startsWith('/kiosk')
  return (
    <div className="app-root">
      <header className="topbar">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <h1 style={{margin:0}}><Link to="/visitor/home" style={{color:'#fff',textDecoration:'none'}}>Visitor Management</Link></h1>
          {showKioskTopNav && (
            <nav className="kiosk-top-nav">
              <NavLink to="/kiosk" end className={({isActive})=> isActive? 'top-nav-active':'top-nav-link'}>Home</NavLink>
              <NavLink to="/kiosk/checkin" className={({isActive})=> isActive? 'top-nav-active':'top-nav-link'}>Check in</NavLink>
              <NavLink to="/kiosk/checkout" className={({isActive})=> isActive? 'top-nav-active':'top-nav-link'}>Check out</NavLink>
              <NavLink to="/kiosk/status" className={({isActive})=> isActive? 'top-nav-active':'top-nav-link'}>Status</NavLink>
            </nav>
          )}
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<div>Welcome to Visitor Management</div>} />

          <Route path="/visitor/*" element={<VisitorLayout/>}>
            <Route index element={<VisitorLogin/>} />
            <Route path="home" element={<VisitorHome/>} />
            <Route path="appointments" element={<VisitorHostList/>} />
            <Route path="appointment" element={<VisitorAppointments/>} />
            <Route path="history" element={<VisitorHistory/>} />
            <Route path="notifications" element={<VisitorNotifications/>} />
          </Route>

          <Route path="/kiosk/*" element={<KioskLayout/>}>
            <Route path="" element={<KioskHome/>} />
            <Route path="departments" element={<KioskDepartments/>} />
            <Route path="hosts" element={<KioskHosts/>} />
            <Route path="book" element={<KioskBook/>} />
            <Route path="checkin" element={<KioskCheckin/>} />
            <Route path="checkout" element={<KioskCheckout/>} />
            <Route path="status" element={<KioskStatus/>} />
          </Route>

          <Route path="/host/*" element={<HostLayout/>}>
            <Route index element={<HostHome/>} />
            <Route path="schedule" element={<HostSchedule/>} />
            <Route path="schedule/day" element={<HostScheduleDay/>} />
            <Route path="pending" element={<HostPending/>} />
            <Route path="appoint" element={<HostAppoint/>} />
            <Route path="secratery" element={<HostSecratery/>} />
            <Route path="history" element={<HostHistory/>} />
            <Route path="notifications" element={<HostNotifications/>} />
          </Route>

          <Route path="/receptionist/*" element={<ReceptionistLayout/>}>
            <Route index element={<ReceptionistHome/>} />
            <Route path="hosts" element={<ReceptionistHosts/>} />
            <Route path="visitors" element={<ReceptionistVisitors/>} />
            <Route path="make" element={<ReceptionistMake/>} />
            <Route path="history" element={<ReceptionistHistory/>} />
            <Route path="notifications" element={<ReceptionistNotifications/>} />
            <Route path="nextday" element={<ReceptionistNextDay/>} />
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
