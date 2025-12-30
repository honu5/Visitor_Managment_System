import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchReceptionistNotifications } from '../../api/receptionistApi'

function renderBoldMessage(text){
  const s = String(text ?? '')
  const parts = s.split('**')
  if(parts.length < 3) return s
  return parts.map((p, i) => (
    i % 2 === 1 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
  ))
}

export default function ReceptionistNotifications(){
  const {data,loading} = useFetch(fetchReceptionistNotifications,[])
  if(loading) return <div>Loading...</div>
  const notes = Array.isArray(data) ? data : []
  return (
    <div>
      <h2>Receptionist Notifications</h2>
      <div className="card wide-card">
        {notes.length === 0 ? (
          <div style={{color:'#666'}}>No notifications.</div>
        ) : (
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {notes.map((n)=>(
              <li key={n.id ?? n.time ?? Math.random()} className="notification-item">{renderBoldMessage(n.message ?? JSON.stringify(n))}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
