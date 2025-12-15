import React, {useEffect, useState} from 'react'

function addDays(d, n){ const dt = new Date(d); dt.setDate(dt.getDate()+n); dt.setHours(0,0,0,0); return dt }

export default function HostSchedule(){
  const [data,setData] = useState([])
  const start = new Date()
  const days = Array.from({length:7},(_,i)=> addDays(start,i))

  useEffect(()=>{
    // create mock schedule: each day has 3 appointments and 2 blocks (mocked times)
    const mock = []
    days.forEach((d,idx)=>{
      // three appointments
      mock.push({date:d.toISOString(), type:'appointment', visitorName: idx%2===0? 'Dawit Kassa' : 'Alemu Damtew', time:'09:00'})
      mock.push({date:d.toISOString(), type:'appointment', visitorName: 'Bezawit Buzaane', time:'11:00'})
      mock.push({date:d.toISOString(), type:'appointment', visitorName: 'Shewaye Damte', time:'14:00'})
      // two blocks
      if(idx%3!==0){
        mock.push({date:d.toISOString(), type:'block', label:'12:00-13:00'})
        mock.push({date:d.toISOString(), type:'block', label:'16:00-16:30'})
      }
    })
    setData(mock)
  },[])

  const totalWorkingHours = 10

  return (
    <div>
      <h2 style={{textAlign:'center'}}>Host Schedule (Next 7 days)</h2>
      <div style={{margin:'12px 0',textAlign:'center'}}>
        <small style={{color:'#666'}}>Legend: <span style={{padding:'4px 8px',background:'#e6ffed',borderRadius:6,marginLeft:6}}>Approved</span> <span style={{padding:'4px 8px',background:'#ffcfcf',borderRadius:6,marginLeft:6}}>Blocked</span> <span style={{padding:'4px 8px',background:'#fff',border:'1px solid #eee',borderRadius:6,marginLeft:6}}>Appointment</span></small>
      </div>

      <div className="nine-grid">
        {days.map((d,idx)=>{
          const items = (data||[]).filter(it => new Date(it.date).toDateString() === d.toDateString())
          const appointments = items.filter(i=>i.type==='appointment').length
          const blocks = items.filter(i=>i.type==='block').length
          const freeSlots = Math.max(0, totalWorkingHours - (appointments + blocks))
          const freePercent = Math.round((freeSlots/totalWorkingHours)*100)

          return (
            <div className="day-card card" key={idx}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontWeight:700}}>{d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div>
                <div style={{fontSize:12,color:'#666'}}>{freePercent}% free</div>
              </div>
              <div style={{marginTop:10}}>
                {items.length===0 ? (
                  <div className="slot slot-free">Free</div>
                ) : (
                  items.map((it,i)=> (
                    <div key={i} className={it.type==='block' ? 'slot slot-blocked' : 'slot slot-free'}>
                      <div style={{fontWeight:700}}>{it.type==='block' ? (it.label || 'Blocked') : (it.visitorName || 'Appointment')}</div>
                      <div style={{fontSize:12,color:'#666'}}>{it.time || it.label || ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
