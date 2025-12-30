import React, {useEffect, useState} from 'react'
import { fetchVisitorNotifications } from '../../api/visitorApi'

function renderBoldMessage(text){
  const s = String(text ?? '')
  const parts = s.split('**')
  if(parts.length < 3) return s
  return parts.map((p, i) => (
    i % 2 === 1 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
  ))
}

export default function VisitorNotifications(){
  const [notes,setNotes] = useState([])
  const [error,setError] = useState('')
  const [email] = useState(() => localStorage.getItem('vms_visitor_email') || '')

  async function reload(){
    try{
      setError('')
      const res = email ? await fetchVisitorNotifications({ email }) : await fetchVisitorNotifications()
      setNotes(Array.isArray(res) ? res : [])
    }catch(e){
      console.error(e)
      setError('Failed to load notifications')
    }
  }

  useEffect(()=>{
    reload()
  },[email])

  async function deleteNote(note){
    try{
      setError('')
      const id = Number(note?.id)
      if(!id || Number.isNaN(id)) return
      const qs = email ? `?email=${encodeURIComponent(email)}` : ''
      const res = await fetch(`/api/visitor/notifications/${id}${qs}`,{ method:'DELETE' })
      const json = await res.json().catch(()=>null)
      if(!res.ok){
        setError(json?.error || 'Failed to delete notification')
        return
      }
      setNotes((notes||[]).filter(n => Number(n.id) !== id))
    }catch(e){
      console.error(e)
      setError('Failed to delete notification')
    }
  }

  return (
    <div>
      <h2>Visitor Notifications</h2>
      {!email && <div style={{color:'#666'}}>Demo mode: showing global visitor notifications.</div>}
      {error && <div style={{color:'#a00',marginBottom:10}}>{error}</div>}
      <div className="card wide-card">
        {(notes||[]).length===0 && <div style={{padding:12,color:'#666'}}>No notifications</div>}
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          {(notes||[]).map((n,i)=>(
            <li key={n.id || i} className="notification-item">
              <div style={{fontSize:12,color:'#666'}}>{n.time ? new Date(n.time).toLocaleString() : ''}</div>
              <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
                <div>{renderBoldMessage(n.message ?? JSON.stringify(n))}</div>
                <button className="button" onClick={()=>deleteNote(n)} style={{height:32}}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
