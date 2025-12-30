import React, { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { fetchReceptionistHistoryVisitors } from '../../api/receptionistApi'

export default function ReceptionistHistory(){
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        setLoading(true)
        setError('')
        const res = await fetchReceptionistHistoryVisitors(200)
        setRows(Array.isArray(res) ? res : [])
      }catch(e){
        console.error(e)
        setError('Failed to load history')
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  return (
    <div>
      <h2 style={{marginBottom:8}}>History</h2>
      {error && <div style={{color:'#a00',marginBottom:10}}>{error}</div>}
      <Card>
        {loading && <div style={{color:'#666'}}>Loading...</div>}
        {!loading && rows.length === 0 && <div style={{color:'#666'}}>No checked-out visitors yet.</div>}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {rows.map(r => (
            <div key={r.id} className="host-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{r.name}</div>
                <div style={{fontSize:13,color:'#666'}}>{r.host} • {r.date} {r.time}</div>
              </div>
              <div style={{padding:'6px 10px',background:'#f0f0f0',color:'#333',borderRadius:8}}>Checked out</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
