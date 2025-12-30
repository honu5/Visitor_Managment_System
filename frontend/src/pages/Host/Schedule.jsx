import React, {useEffect, useMemo, useState} from 'react'
import { useNavigate } from 'react-router-dom'

function startOfDay(d){ const dt = new Date(d); dt.setHours(0,0,0,0); return dt }
function addDays(d, n){ const dt = new Date(d); dt.setDate(dt.getDate()+n); dt.setHours(0,0,0,0); return dt }

function formatHM(dt){
  const d = new Date(dt)
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `${hh}:${mm}`
}

export default function HostSchedule(){
  const navigate = useNavigate()
  const [host] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){return null}
  })
  const [events, setEvents] = useState([])
  const [blocks, setBlocks] = useState([])

  const weekStart = useMemo(()=> startOfDay(new Date()), [])
  const days = useMemo(()=> Array.from({length:7},(_,i)=> addDays(weekStart,i)), [weekStart])
  const hours = useMemo(()=> Array.from({length:11},(_,i)=> i+8), []) // 08:00 .. 18:00

  async function load(){
    try{
      if(!host) return
      const from = days[0].toISOString()
      const to = addDays(days[6], 1).toISOString()
      const res = await fetch(`/api/host/schedule?hostId=${host.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const json = await res.json()
      setEvents(Array.isArray(json) ? json : [])

      const bRes = await fetch(`/api/host/blocks?hostId=${host.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const bJson = await bRes.json()
      setBlocks(Array.isArray(bJson) ? bJson : [])
    }catch(e){ console.error(e) }
  }

  useEffect(()=>{ load() },[host])

  useEffect(()=>{
    function onChanged(){ load() }
    window.addEventListener('vms_schedule_changed', onChanged)
    return ()=> window.removeEventListener('vms_schedule_changed', onChanged)
  },[host, days])

  const byDayHour = useMemo(()=>{
    const m = new Map()
    ;(events||[]).forEach(e=>{
      if(!e.scheduledAt) return
      const d = new Date(e.scheduledAt)
      const dayKey = d.toDateString()
      const hour = d.getHours()
      const key = `${dayKey}__${hour}`
      if(!m.has(key)) m.set(key, [])
      m.get(key).push(e)
    })
    // sort inside each cell by time
    for(const [k,v] of m.entries()){
      v.sort((a,b)=> new Date(a.scheduledAt) - new Date(b.scheduledAt))
      m.set(k,v)
    }
    return m
  },[events])

  const blockedSet = useMemo(()=>{
    const s = new Set()
    ;(blocks||[]).forEach(b=>{
      const d = new Date(b.startAt)
      const key = `${d.toDateString()}__${d.getHours()}`
      s.add(key)
    })
    return s
  },[blocks])

  async function toggleBlockForCell(day, hour){
    if(!host) return
    const dt = new Date(day)
    dt.setHours(hour,0,0,0)
    try{
      const res = await fetch('/api/host/block-time',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ hostId: host.id, startAt: dt.toISOString() })
      })
      const json = await res.json().catch(()=>null)
      if(!res.ok){
        alert(json?.error || 'Failed to toggle block')
        return
      }
      await load()
      window.dispatchEvent(new Event('vms_schedule_changed'))
    }catch(e){ console.error(e) }
  }

  return (
    <div className="wide-card">
      <h2 style={{textAlign:'center'}}>Host Schedule</h2>
      <div style={{textAlign:'center',color:'#666',marginBottom:10}}>
        Click the spot to block it. Click again to unblock it.
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <div style={{minWidth:980}}>
          {/* Header row */}
          <div style={{display:'grid',gridTemplateColumns:`90px repeat(7, 1fr)`,borderBottom:'1px solid #eef2f7'}}>
            <div style={{padding:10,color:'#666',fontSize:12}}>Time</div>
            {days.map((d,idx)=>(
              <div key={idx} style={{padding:10,fontWeight:700,textAlign:'center'}}>
                {d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}
              </div>
            ))}
          </div>

          {/* Time grid */}
          {hours.map(h=> (
            <div key={h} style={{display:'grid',gridTemplateColumns:`90px repeat(7, 1fr)`,borderBottom:'1px solid #f1f5f9'}}>
              <div style={{padding:'10px 10px',fontSize:12,color:'#666'}}>{String(h).padStart(2,'0')}:00</div>
              {days.map((d,idx)=>{
                const key = `${d.toDateString()}__${h}`
                const cellEvents = byDayHour.get(key) || []
                const isBlocked = blockedSet.has(key)
                const cls = isBlocked ? 'slot slot-blocked' : (cellEvents.length>0 ? 'slot slot-has-appointments' : 'slot slot-free')
                const canToggle = cellEvents.length===0
                const tip = isBlocked
                  ? 'Click the spot to unblock it'
                  : (canToggle ? 'Click the spot to block it' : 'Scheduled appointment')
                return (
                  <div
                    key={idx}
                    className={cls}
                    style={{margin:6, minHeight:54, cursor: canToggle ? 'pointer' : 'default'}}
                    onClick={()=>{
                      if(!canToggle) return
                      toggleBlockForCell(d,h)
                    }}
                    title={tip}
                  >
                    {cellEvents.slice(0,2).map(ev=> (
                      <div key={ev.id} style={{fontSize:12, fontWeight:700, marginBottom:4}}>
                        {formatHM(ev.scheduledAt)} — {ev.fullName}
                      </div>
                    ))}
                    {cellEvents.length>2 && (
                      <div style={{fontSize:12,color:'#245'}}>{cellEvents.length-2} more…</div>
                    )}
                    {cellEvents.length===0 && isBlocked && (
                      <div style={{fontSize:12,fontWeight:700}}>Blocked</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
