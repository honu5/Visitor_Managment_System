import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchAnalytics } from '../../api/adminApi'

export default function AdminAnalytics(){
  const {data,loading} = useFetch(fetchAnalytics,[])
  if(loading) return <div>Loading...</div>
  const week = data?.week || {}
  const system = data?.system || {}
  return (
    <div>
      <h2>Admin - Analytics</h2>

      <div className="card">
        <h3>This Week Analytics</h3>
        <div className="grid">
          <div>Appointments: <strong>{week.appointments ?? 0}</strong></div>
          <div>Hours of appointments: <strong>{week.appointmentHours ?? 0}</strong></div>
          <div>Visitors (Kiosk): <strong>{week.visitorsKiosk ?? 0}</strong></div>
          <div>Visitors (Online): <strong>{week.visitorsOnline ?? 0}</strong></div>
          <div>Requests from Receptionist: <strong>{week.receptionistRequests ?? 0}</strong></div>
        </div>
      </div>

      <div className="card">
        <h3>System Analytics</h3>
        <div className="grid">
          <div>Total departments: <strong>{system.departments ?? 0}</strong></div>
          <div>Total hosts: <strong>{system.hosts ?? 0}</strong></div>
          <div>Total appointments made so far: <strong>{system.appointmentsTotal ?? 0}</strong></div>
        </div>
      </div>
    </div>
  )
}
