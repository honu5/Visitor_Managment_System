import React, {useState, useEffect} from 'react'
import Card from '../../components/Card'

const MOCK_HISTORY = [
  {id: 'a1', hostName: 'Gemechu Getahun', fullName: 'Alice Solomon', date: '2025-11-12', time: '10:30', status: 'Accepted', description: 'Meeting about project X'},
  {id: 'a2', hostName: 'Honelign Yohannes', fullName: 'Bob Desta', date: '2025-10-02', time: '14:00', status: 'Completed', description: 'Interview'},
  {id: 'a3', hostName: 'Teshale Mekuria', fullName: 'Chala Kassa', date: '2025-09-21', time: '09:15', status: 'Cancelled', description: 'Delivery pickup'}
]

export default function VisitorHistory(){
  const [data,setData] = useState([])
  const [selected,setSelected] = useState(null)

  useEffect(()=>{
    // use mock data for now; if remote fetch is added later, merge here
    setData(MOCK_HISTORY)
  },[])

  if(!data) return <div>Loading...</div>

  return (
    <div>
      <h2>Appointment History</h2>

      {!selected && (
        <div className="card">
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {data.map(a=> (
              <li key={a.id} style={{padding:12,borderBottom:'1px solid #eee',cursor:'pointer'}} onClick={()=>setSelected(a)}>
                <strong>{a.hostName}</strong>
                <div style={{fontSize:12,color:'#666'}}>{new Date(a.date).toLocaleDateString()} — {a.time}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <Card>
          <h3>Appointment Detail</h3>
          <div><strong>ID:</strong> {selected.id}</div>
          <div><strong>Host:</strong> {selected.hostName}</div>
          <div><strong>Visitor:</strong> {selected.fullName}</div>
          <div><strong>Date:</strong> {selected.date}</div>
          <div><strong>Time:</strong> {selected.time}</div>
          <div style={{marginTop:8}}><strong>Status:</strong> {selected.status}</div>
          <div style={{marginTop:8}}><strong>Description:</strong> {selected.description}</div>
          <div style={{marginTop:12}}>
            <button className="button" onClick={()=>setSelected(null)}>Back to history</button>
          </div>
        </Card>
      )}
    </div>
  )
}
