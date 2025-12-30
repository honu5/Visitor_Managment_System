import React, {useState, useEffect} from 'react'

export default function HostPending(){
  const [data,setData] = useState([])
  const [selected,setSelected] = useState(null)
  const [host, setHost] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){return null} })
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        if(!host) return
        const res = await fetch(`/api/host/pending?hostId=${host.id}`)
        const json = await res.json()
        setData(json)
      }catch(e){ console.error(e) }
    }
    load()
  },[host])

  function buildScheduledAtISO(){
    if(!scheduleDate || !scheduleTime) return null
    // scheduleDate: YYYY-MM-DD, scheduleTime: HH:MM
    const isoLike = `${scheduleDate}T${scheduleTime}:00`
    const dt = new Date(isoLike)
    if(Number.isNaN(dt.getTime())) return null
    return dt.toISOString()
  }

  async function doApprove(a){
    try{
      setActionError('')
      const scheduledAt = buildScheduledAtISO()
      if(!scheduledAt){
        setActionError('Please select a valid date and time before approving.')
        return
      }
      const res = await fetch(`/api/host/pending/${a.id}/approve`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ scheduledAt })
      })
      if(!res.ok){
        const j = await res.json().catch(()=>null)
        setActionError(j?.error || 'Approve failed')
        return
      }
      setData(d=>d.filter(x=>x.id!==a.id))
      setSelected(null)
      setScheduleDate('')
      setScheduleTime('')
      window.dispatchEvent(new Event('vms_schedule_changed'))
    }catch(e){ console.error(e) }
  }
  async function doReject(a){
    try{
      setActionError('')
        const raw = window.prompt('In how many days can the visitor re-apply?', '7')
        if (raw === null) return

        const cooldownDays = Number(raw)
        if (!Number.isFinite(cooldownDays) || cooldownDays < 0) {
          alert('Please enter a valid number of days (0 or more).')
          return
        }

        const resp = await fetch(`/api/host/pending/${a.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cooldownDays }),
        })

        if (!resp.ok) {
          const data = await resp.json().catch(() => null)
          alert(data?.error || 'Failed to reject appointment')
          return
        }
      setData(d=>d.filter(x=>x.id!==a.id))
      setSelected(null)
      setScheduleDate('')
      setScheduleTime('')
    }catch(e){ console.error(e) }
  }

  useEffect(()=>{
    // reset scheduling inputs when picking a different request
    setScheduleDate('')
    setScheduleTime('')
    setActionError('')
  },[selected?.id])

  return (
    <div>
      <h2>Pending Appointments</h2>
      <div className="card wide-card">
        {(data||[]).length===0 && <div>No pending appointments</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:12}}>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {(data||[]).map(a=> (
              <li key={a.id} style={{padding:12,borderBottom:'1px solid #f1f3f6',cursor:'pointer'}} onClick={()=>setSelected(a)}> 
                <div style={{fontWeight:700}}>{a.fullName}</div>
                <div style={{color:'#666'}}>{a.email || a.phone || ''} • {a.description || a.visitorType || ''}</div>
              </li>
            ))}
          </ul>
          <div>
            <div className="card">
              <div style={{color:'#666'}}>Select a pending appointment to see details</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating modal for selected visitor */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="floating-card" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setSelected(null)}>✕</button>
            <h3>Visitor detail</h3>
            <div><strong>Name:</strong> {selected.fullName}</div>
            <div><strong>Contact:</strong> {selected.email || selected.phone}</div>
            <div><strong>Purpose:</strong> {selected.description}</div>
            <div><strong>Visitor type:</strong> {selected.visitorType || 'Guest'}</div>
            <div style={{marginTop:12}}><strong>Submitted at:</strong><div style={{marginTop:6,color:'#333'}}>{new Date(selected.createdAt).toLocaleString()}</div></div>

            <div style={{marginTop:14}}>
              <strong>Schedule appointment</strong>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
                <div className="form-row" style={{marginBottom:0}}>
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} />
                </div>
                <div className="form-row" style={{marginBottom:0}}>
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} />
                </div>
              </div>
              {actionError && <div style={{marginTop:10,color:'#a00'}}>{actionError}</div>}
            </div>

            <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
              <button className="button" onClick={()=>doApprove(selected)} style={{marginRight:8}}>Approve</button>
              <button className="button" onClick={()=>doReject(selected)} style={{background:'#c33'}}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
