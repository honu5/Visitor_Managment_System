import React, {useEffect, useState} from 'react'

const MOCK_NOTES = [
  {id: 'n1', message: 'Host Gemechu accepted your appointment.', time: '2025-11-12T10:35:00Z'},
  {id: 'n2', message: 'Your appointment with Honelign was completed.', time: '2025-10-02T15:00:00Z'}
]

export default function VisitorNotifications(){
  const [localNotes,setLocalNotes] = useState([])
  const [remoteNotes,setRemoteNotes] = useState([])

  useEffect(()=>{
    const existing = JSON.parse(localStorage.getItem('vms_notifications') || '[]')
    setLocalNotes(existing)
    // use mock remote notes for now
    setRemoteNotes(MOCK_NOTES)
  },[])

  const combined = [...(localNotes||[]),...(remoteNotes||[])]
  return (
    <div>
      <h2>Visitor Notifications</h2>
      <ul>
        {combined.map((n,i)=>(
          <li key={n.id || i} style={{padding:10,borderBottom:'1px solid #eee'}}>
            <div style={{fontSize:12,color:'#666'}}>{n.time ? new Date(n.time).toLocaleString() : ''}</div>
            <div>{n.message ?? JSON.stringify(n)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
