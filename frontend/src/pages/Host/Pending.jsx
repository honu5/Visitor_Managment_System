import React, {useState, useEffect} from 'react'

const MOCK_PENDING = [
  {id:'p1', visitorName:'Dawit Kassa', contact:'+251912345678', purpose:'Project meeting'},
  {id:'p2', visitorName:'Alemu Damtew', contact:'+251911223344', purpose:'Delivery'},
  {id:'p3', visitorName:'Bezawit Buzaane', contact:'bez@example.com', purpose:'Interview'}
]

export default function HostPending(){
  const [data,setData] = useState([])

  useEffect(()=>{
    setData(MOCK_PENDING)
  },[])

  function doApprove(a){
    alert('Approved (mock): ' + a.visitorName)
    setData(d=>d.filter(x=>x.id!==a.id))
  }
  function doReject(a){
    alert('Rejected (mock): ' + a.visitorName)
    setData(d=>d.filter(x=>x.id!==a.id))
  }

  return (
    <div>
      <h2>Pending Appointments</h2>
      <div className="card">
        {(data||[]).length===0 && <div>No pending appointments</div>}
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          {(data||[]).map(a=> (
            <li key={a.id} style={{padding:12,borderBottom:'1px solid #f1f3f6'}}> 
              <div style={{fontWeight:700}}>{a.visitorName}</div>
              <div style={{color:'#666'}}>{a.contact} • {a.purpose}</div>
              <div style={{marginTop:8}}>
                <button className="button" onClick={()=>doApprove(a)} style={{marginRight:8}}>Approve</button>
                <button className="button" onClick={()=>doReject(a)} style={{background:'#c33'}}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
