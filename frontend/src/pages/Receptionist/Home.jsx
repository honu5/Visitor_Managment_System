import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { fetchReceptionistOnsiteVisitors, fetchReceptionistTodayVisitors, receptionistCheckIn, receptionistCheckOut, receptionistDelay } from '../../api/receptionistApi'

export default function ReceptionistHome(){
  const navigate = useNavigate()
  const [onsite,setOnsite] = useState([])
  const [today,setToday] = useState([])
  const [error,setError] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        setError('')
        const [o,t] = await Promise.all([
          fetchReceptionistOnsiteVisitors(),
          fetchReceptionistTodayVisitors(3)
        ])
        setOnsite(Array.isArray(o) ? o : [])
        setToday(Array.isArray(t) ? t : [])
      }catch(e){
        console.error(e)
        setError('Failed to load receptionist dashboard')
      }
    }
    load()
  },[])

  async function doCheckIn(appt){
    try{
      const res = await receptionistCheckIn(appt.id)
      if(res?.error) throw new Error(res.error)
      setToday(t=>t.filter(x=>x.id!==appt.id))
      setOnsite(s=> s.find(x=>x.id===appt.id) ? s : [{...appt, status:'checked-in'}, ...s])
    }catch(e){
      console.error(e)
      setError('Failed to check in')
    }
  }

  async function doCheckOut(appt){
    try{
      const res = await receptionistCheckOut(appt.id)
      if(res?.error) throw new Error(res.error)
      setToday(t=>t.filter(x=>x.id!==appt.id))
      setOnsite(s=>s.filter(x=>x.id!==appt.id))
    }catch(e){
      console.error(e)
      setError('Failed to check out')
    }
  }

  async function doDelay(appt){
    const when = window.prompt('Reschedule time (YYYY-MM-DD HH:MM):','')
    if(when==null) return
    const parsed = new Date(when)
    if(Number.isNaN(parsed.getTime())){ setError('Invalid date/time format'); return }
    try{
      const res = await receptionistDelay(appt.id, parsed.toISOString())
      if(res?.error) throw new Error(res.error)
      // reload today list because it may change ordering or move off today
      const t = await fetchReceptionistTodayVisitors(3)
      setToday(Array.isArray(t) ? t : [])
      setError('')
    }catch(e){
      console.error(e)
      setError('Failed to delay appointment')
    }
  }

  return (
    <div className="wide-card">
      <div style={{textAlign:'center',marginBottom:12}}>
        <div className="host-dashboard-date">Receptionist Dashboard</div>
      </div>

      {error && <div style={{color:'#a00',marginBottom:10}}>{error}</div>}

      <div style={{display:'flex',flexDirection:'column',gap:16,alignItems:'stretch'}}>
        <div>
          <Card>
            <h3 style={{marginTop:0}}>Onsite Visitors</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {onsite.map(v=> (
                <div key={v.id} className="host-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>{v.name}</div>
                    <div style={{fontSize:13,color:'#666'}}>{v.host}</div>
                  </div>
                  <div>
                    {v.status==='checked-in' && <div style={{padding:'6px 10px',background:'#e6ffed',color:'#046',borderRadius:8}}>Checked in</div>}
                    {v.status==='checked-out' && <div style={{padding:'6px 10px',background:'#f0f0f0',color:'#333',borderRadius:8}}>Checked out</div>}
                    <div style={{marginTop:8}}>
                      <button className="button" onClick={()=>doCheckOut(v)}>Check out</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 style={{marginTop:0}}>Arriving — Today</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {today.map(v=> (
                <div key={v.id} className="host-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>{v.name}</div>
                    <div style={{fontSize:13,color:'#666'}}>{v.host} • {v.time}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
                    {(v.status==='approved' || v.status==='accepted') && (
                      <>
                        <button className="btn-blue" style={{marginBottom:8}} onClick={()=>doCheckIn(v)}>Check in</button>
                        <button className="btn-red" onClick={()=>doDelay(v)}>Delay</button>
                      </>
                    )}
                    {v.status==='delayed' && (
                      <div style={{padding:'6px 10px',background:'#ffcfcf',color:'#700',borderRadius:8}}>Delayed</div>
                    )}
                    {v.status==='checked-in' && (
                      <button className="btn-red" onClick={()=>doCheckOut(v)}>Check out</button>
                    )}
                    {v.status==='checked-out' && (
                      <div style={{padding:'6px 10px',background:'#f0f0f0',color:'#333',borderRadius:8}}>Checked out</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 style={{marginTop:0}}>Actions</h3>
            <div style={{display:'flex',justifyContent:'center',marginTop:8}}>
              <button className="make-appointment-button" onClick={()=>navigate('/receptionist/make')}>+ Make appointment</button>
            </div>
            
          </Card>
        </div>
      </div>
    </div>
  )
}
