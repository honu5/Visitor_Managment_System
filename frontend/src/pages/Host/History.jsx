import React, {useEffect, useState} from 'react'
import Card from '../../components/Card'

const MOCK_HISTORY = [
  {id:'h1', visitorName:'Dawit Kassa', date:'2025-12-01', time:'09:30', status:'Completed'},
  {id:'h2', visitorName:'Alemu Damtew', date:'2026-01-10', time:'11:00', status:'Scheduled'},
  {id:'h3', visitorName:'Bezawit Buzaane', date:'2025-11-20', time:'14:00', status:'Cancelled'},
  {id:'h4', visitorName:'Shewaye Damte', date:'2026-01-18', time:'13:00', status:'Scheduled'}
]

function isFuture(d){ return new Date(d) > new Date() }

export default function HostHistory(){
  const [data,setData] = useState([])
  const [filter,setFilter] = useState('past') // 'past' or 'future'

  useEffect(()=>{
    setData(MOCK_HISTORY)
  },[])

  const shown = data.filter(d=> filter==='past' ? !isFuture(d.date) : isFuture(d.date))

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
              <div style={{fontWeight:700}}>{r.visitorName}</div>
              <div style={{fontSize:13,color:'#666'}}>{new Date(r.date).toLocaleDateString()} • {r.time} • {r.status}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
