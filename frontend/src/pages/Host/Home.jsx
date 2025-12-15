import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'

const MOCK_NEXT = [
  {id:'m1', visitorName:'Dawit Kassa', time:'09:30', date:'2025-12-16'},
  {id:'m2', visitorName:'Alemu Damtew', time:'11:00', date:'2025-12-16'},
  {id:'m3', visitorName:'Bezawit Buzaane', time:'14:00', date:'2025-12-16'}
]

const MOCK_PENDING = [
  {id:'p1', visitorName:'Shewaye Damte', contact:'+251912345678', purpose:'Meeting'},
  {id:'p2', visitorName:'Alemu Damtew', contact:'+251911223344', purpose:'Delivery'},
  {id:'p3', visitorName:'Bezawit Buzaane', contact:'bez@example.com', purpose:'Interview'}
]

function formatDate(d){
  const dt = new Date(d)
  return dt.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric'})
}

export default function HostHome(){
  const navigate = useNavigate()
  const [next,setNext] = useState([])
  const [pending,setPending] = useState([])

  useEffect(()=>{
    setNext(MOCK_NEXT)
    setPending(MOCK_PENDING)
  },[])

  const today = new Date()

  return (
    <div>
      <div style={{textAlign:'center',marginBottom:12}}>
        <div className="host-dashboard-date">{today.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Card>
          <h3>Next 3 Appointments</h3>
          {next.map(a=> (
            <div key={a.id} style={{padding:'8px 0',borderBottom:'1px solid #f3f5f8'}}>
              <div style={{fontWeight:700}}>{a.visitorName}</div>
              <div style={{fontSize:13,color:'#666'}}>{formatDate(a.date)} — {a.time}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h3>Pending</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {pending.slice(0,3).map(p=> (
              <div key={p.id} className="host-card">
                <div style={{fontWeight:700}}>{p.visitorName}</div>
                <div style={{fontSize:12,color:'#666'}}>{p.purpose}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
            <button className="button" onClick={()=>navigate('/host/pending')}>See more pending</button>
          </div>
        </Card>
      </div>

      <div style={{marginTop:12,display:'flex',justifyContent:'center'}}>
        <button className="button" style={{display:'flex',alignItems:'center',gap:8}} onClick={()=>navigate('/host/appoint')}>
          <span style={{fontSize:20,lineHeight:1}}>+</span> Make appointment
        </button>
      </div>
    </div>
  )
}
