import React, {useEffect, useState} from 'react'

const MOCK_NOTES = [
  {id:'h1', message:'Dawit Kassa appointment accepted', time:'2025-12-14T09:30:00Z'},
  {id:'h2', message:'Bezawit Buzaane requested reschedule', time:'2025-12-13T15:00:00Z'}
]

export default function HostNotifications(){
  const [localNotes,setLocalNotes] = useState([])
  const [remoteNotes,setRemoteNotes] = useState([])

  useEffect(()=>{
    const existing = JSON.parse(localStorage.getItem('vms_notifications') || '[]')
    setLocalNotes(existing)
    setRemoteNotes(MOCK_NOTES)
  },[])

  const combined = [...(remoteNotes||[]),...(localNotes||[])]

  return (
    <div>
      <h2>Host Notifications</h2>
      <ul style={{listStyle:'none',padding:0}}>
        {combined.map((n,i)=>(
          <li key={n.id || i} style={{padding:10,borderBottom:'1px solid #eee'}}>
            <div style={{fontSize:12,color:'#666'}}>{n.time ? new Date(n.time).toLocaleString() : ''}</div>
            <div>{n.message}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
