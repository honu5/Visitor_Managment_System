import React, {useEffect, useState} from 'react'
import Card from '../../components/Card'

function isFutureDateTime(dt){ return new Date(dt) > new Date() }

export default function HostHistory(){
  const [data,setData] = useState([])
  const [filter,setFilter] = useState('past') // 'past' or 'future'
  const [host] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){return null}
  })
  const [rescheduleOpen,setRescheduleOpen] = useState(false)
  const [rescheduleTarget,setRescheduleTarget] = useState(null)
  const [rescheduleDate,setRescheduleDate] = useState('')
  const [rescheduleTime,setRescheduleTime] = useState('')
  const [rescheduleError,setRescheduleError] = useState('')
  const [rescheduleBusy,setRescheduleBusy] = useState(false)

  async function reload(){
    try{
      if(!host) return
      const res = await fetch(`/api/host/history?hostId=${host.id}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    }catch(e){ console.error(e) }
  }

  useEffect(()=>{
    reload()
  },[host])

  function openReschedule(appt){
    reschedule(appt)
  }

  function closeReschedule(){
    if(rescheduleBusy) return
    setRescheduleOpen(false)
    setRescheduleTarget(null)
    setRescheduleDate('')
    setRescheduleTime('')
    setRescheduleError('')
  }

  function buildScheduledAtISO(){
    if(!rescheduleDate || !rescheduleTime) return null
    const isoLike = `${rescheduleDate}T${rescheduleTime}:00`
    const dt = new Date(isoLike)
    if(Number.isNaN(dt.getTime())) return null
    return dt.toISOString()
  }

  async function submitReschedule(e){
    e.preventDefault()
    try{
      setRescheduleError('')
      if(!rescheduleTarget?.id){
        setRescheduleError('Missing appointment')
        return
      }
      const scheduledAt = buildScheduledAtISO()
      if(!scheduledAt){
        setRescheduleError('Please select a valid date and time.')
        return
      }

      setRescheduleBusy(true)
      const res = await fetch(`/api/host/appointments/${rescheduleTarget.id}/reschedule`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ hostId: host?.id, scheduledAt })
      })
      const json = await res.json().catch(()=>null)
      if(!res.ok){
        setRescheduleError(json?.error || 'Failed to reschedule')
        return
      }

      await reload()
      window.dispatchEvent(new Event('vms_schedule_changed'))
      closeReschedule()
    }catch(e){
      console.error(e)
      setRescheduleError('Failed to reschedule')
    }finally{
      setRescheduleBusy(false)
    }
  }

  async function reschedule(appt){
    setRescheduleError('')
    setRescheduleTarget(appt)
    const dt = appt?.scheduledAt ? new Date(appt.scheduledAt) : null
    if(dt && !Number.isNaN(dt.getTime())){
      const yyyy = String(dt.getFullYear())
      const mm = String(dt.getMonth()+1).padStart(2,'0')
      const dd = String(dt.getDate()).padStart(2,'0')
      const hh = String(dt.getHours()).padStart(2,'0')
      const min = String(dt.getMinutes()).padStart(2,'0')
      setRescheduleDate(`${yyyy}-${mm}-${dd}`)
      setRescheduleTime(`${hh}:${min}`)
    }else{
      setRescheduleDate('')
      setRescheduleTime('')
    }
    setRescheduleOpen(true)
  }

  const shown = data
    .filter(a => a.scheduledAt)
    .filter(a => filter==='past' ? !isFutureDateTime(a.scheduledAt) : isFutureDateTime(a.scheduledAt))
    .sort((a,b)=> new Date(a.scheduledAt) - new Date(b.scheduledAt))

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Host History</h2>
        <div>
          <button className={filter==='past'? 'nav-active':'nav-item'} onClick={()=>setFilter('past')} style={{marginRight:8}}>Past</button>
          <button className={filter==='future'? 'nav-active':'nav-item'} onClick={()=>setFilter('future')}>Future</button>
        </div>
      </div>

      <Card>
        {shown.length===0 && <div style={{padding:16}}>No records</div>}
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          {shown.map(r=> (
            <li key={r.id} style={{padding:12,borderBottom:'1px solid #f1f3f6'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                <div>
                  <div style={{fontWeight:700}}>{r.fullName}</div>
                  <div style={{fontSize:13,color:'#666'}}>
                    {new Date(r.scheduledAt).toLocaleString()} • {r.rescheduledAt ? 'rescheduled' : r.status}
                  </div>
                </div>
                {filter==='future' && (
                  <button className="button" onClick={()=>openReschedule(r)} style={{height:34}}>Reschedule</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {rescheduleOpen && (
        <div className="modal-overlay" onClick={closeReschedule}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Reschedule appointment</h3>
            <div style={{opacity:.8,marginBottom:10}}>
              {rescheduleTarget?.fullName} ({rescheduleTarget?.email})
            </div>
            <form onSubmit={submitReschedule}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div className="form-row" style={{marginBottom:0}}>
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={rescheduleDate} onChange={e=>setRescheduleDate(e.target.value)} required />
                </div>
                <div className="form-row" style={{marginBottom:0}}>
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={rescheduleTime} onChange={e=>setRescheduleTime(e.target.value)} required />
                </div>
              </div>
              {rescheduleError && <div style={{marginTop:10,color:'#a00'}}>{rescheduleError}</div>}
              <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:14}}>
                <button type="button" className="button" onClick={closeReschedule} disabled={rescheduleBusy}>Cancel</button>
                <button type="submit" className="button" disabled={rescheduleBusy}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
