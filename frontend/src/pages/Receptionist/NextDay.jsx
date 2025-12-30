import React, {useEffect, useState} from 'react'
import Card from '../../components/Card'
import { fetchReceptionistNextDayVisitors } from '../../api/receptionistApi'

export default function NextDay(){
  const [rows,setRows] = useState([])
  const [error,setError] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        setError('')
        const res = await fetchReceptionistNextDayVisitors()
        setRows(Array.isArray(res) ? res : [])
      }catch(e){
        console.error(e)
        setError('Failed to load next day visitors')
      }
    }
    load()
  },[])
  return (
    <div>
      <h2>Next Day's Visitors</h2>
      {error && <div style={{color:'#a00',marginBottom:10}}>{error}</div>}
      <Card>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {rows.map(r=> (
            <div key={r.id} className="host-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{r.name}</div>
                <div style={{fontSize:13,color:'#666'}}>{r.host} • {r.date} {r.time}</div>
              </div>
              <div>
                <div style={{padding:'6px 10px',background:'#eef6ff',color:'#024',borderRadius:8}}>Scheduled</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
