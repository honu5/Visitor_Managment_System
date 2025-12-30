import React, {useEffect, useState} from 'react'

function renderBoldMessage(text){
  const s = String(text ?? '')
  const parts = s.split('**')
  if(parts.length < 3) return s
  return parts.map((p, i) => (
    i % 2 === 1 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
  ))
}

export default function HostNotifications(){
  const [notes,setNotes] = useState([])
  const [error,setError] = useState('')
  const [host] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){return null}
  })

  useEffect(()=>{
    async function load(){
      try{
        if(!host) return
        setError('')
        const res = await fetch(`/api/host/notifications?hostId=${host.id}`)
        const json = await res.json()
        setNotes(Array.isArray(json) ? json : [])
      }catch(e){ console.error(e) }
    }
    load()
  },[host])

  async function deleteNote(note){
    try{
      if(!host) return
      setError('')
      const id = String(note?.id || '')
      if(!id.startsWith('note-')) return
      const res = await fetch(`/api/host/notifications/${encodeURIComponent(id)}?hostId=${host.id}`,{ method:'DELETE' })
      const json = await res.json().catch(()=>null)
      if(!res.ok){
        setError(json?.error || 'Failed to delete notification')
        return
      }
      const next = (notes||[]).filter(n => String(n.id) !== id)
      setNotes(next)
    }catch(e){
      console.error(e)
      setError('Failed to delete notification')
    }
  }

  return (
    <div>
      <h2>Host Notifications</h2>
      {error && <div style={{color:'#a00',marginBottom:10}}>{error}</div>}
      <div className="card wide-card">
        {(notes||[]).length===0 && <div style={{padding:12,color:'#666'}}>No notifications</div>}
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          {(notes||[]).map((n,i)=>(
            <li key={n.id || i} className="notification-item">
              <div style={{fontSize:12,color:'#666'}}>{n.time ? new Date(n.time).toLocaleString() : ''}</div>
              <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
                <div>{renderBoldMessage(n.message)}</div>
                {String(n.id||'').startsWith('note-') && (
                  <button className="button" onClick={()=>deleteNote(n)} style={{height:32}}>Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
