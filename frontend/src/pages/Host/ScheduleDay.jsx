import React, {useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom'

function useQuery(){ return new URLSearchParams(useLocation().search) }

function dayKeyFromParam(p){ try{ return new Date(p).toDateString() }catch(e){ return new Date().toDateString() } }

function startOfDay(d){ const dt = new Date(d); dt.setHours(0,0,0,0); return dt }
function endOfDay(d){ const dt = new Date(d); dt.setHours(23,59,59,999); return dt }
function formatHM(dt){
  const d = new Date(dt)
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `${hh}:${mm}`
}

export default function HostScheduleDay(){
  const query = useQuery()
  const dateParam = query.get('date')
  const dayKey = dayKeyFromParam(dateParam || new Date().toISOString())

  const [host] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){return null}
  })

  const [events,setEvents] = useState([])

  const day = startOfDay(new Date(dateParam || Date.now()))
  const from = startOfDay(day)
  const to = endOfDay(day)

  async function load(){
    try{
      if(!host) return
      const res = await fetch(`/api/host/schedule?hostId=${host.id}&from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`)
      const json = await res.json()
      setEvents(Array.isArray(json) ? json : [])
    }catch(e){ console.error(e) }
  }

  useEffect(()=>{ load() },[host, dayKey])

  useEffect(()=>{
    function onChanged(){ load() }
    window.addEventListener('vms_schedule_changed', onChanged)
    return ()=> window.removeEventListener('vms_schedule_changed', onChanged)
  },[host, dayKey])

  return (
    <div className="wide-card">
      <h2 style={{textAlign:'center'}}>Schedule for {new Date(dateParam || Date.now()).toLocaleDateString()}</h2>

      <div className="card">
        <div style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:10}}>
          <div style={{color:'#666',fontSize:12,paddingTop:8}}>Time</div>
          <div style={{color:'#666',fontSize:12,paddingTop:8}}>Appointments</div>

          {Array.from({length:11},(_,i)=>i+8).map(hour=>{
            const items = (events||[])
              .filter(e=>e.scheduledAt && new Date(e.scheduledAt).getHours()===hour)
              .sort((a,b)=> new Date(a.scheduledAt) - new Date(b.scheduledAt))
            const cls = items.length>0 ? 'slot slot-has-appointments' : 'slot slot-free'
            return (
              <React.Fragment key={hour}>
                <div style={{fontSize:12,color:'#666',padding:'10px 0'}}>{String(hour).padStart(2,'0')}:00</div>
                <div className={cls} style={{minHeight:54,marginBottom:10}}>
                  {items.length===0 ? (
                    <div style={{fontSize:12,color:'#666'}}>Free</div>
                  ) : (
                    items.map(ev=> (
                      <div key={ev.id} style={{fontWeight:700,fontSize:12,marginBottom:6}}>
                        {formatHM(ev.scheduledAt)} — {ev.fullName}
                      </div>
                    ))
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
