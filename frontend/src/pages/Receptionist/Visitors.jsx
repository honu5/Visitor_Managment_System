import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { fetchReceptionistTodayVisitors, receptionistCheckIn, receptionistCheckOut } from '../../api/receptionistApi'

export default function ReceptionistVisitors(){
  const navigate = useNavigate()
  const [rows,setRows] = useState([])
  const [error,setError] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        setError('')
        const res = await fetchReceptionistTodayVisitors(200)
        setRows(Array.isArray(res) ? res : [])
      }catch(e){
        console.error(e)
        setError('Failed to load visitors')
      }
    }
    load()
  },[])

  async function checkIn(id){
    try{
      const res = await receptionistCheckIn(id)
      if(res?.error) throw new Error(res.error)
      setRows(r=>r.filter(x=>x.id!==id))
    }catch(e){
      console.error(e)
      setError('Failed to check in')
    }
  }
  async function checkOut(id){
    try{
      const res = await receptionistCheckOut(id)
      if(res?.error) throw new Error(res.error)
      setRows(r=>r.filter(x=>x.id!==id))
    }catch(e){
      console.error(e)
      setError('Failed to check out')
    }
  }

  return (
    <div>
      <h2 style={{marginBottom:8}}>Visitors — Today</h2>
      {error && <div style={{color:'#a00',marginBottom:10}}>{error}</div>}
      <Card>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {rows.map(r=> (
            <div key={r.id} className="host-card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{r.name}</div>
                <div style={{fontSize:13,color:'#666'}}>{r.host} • {r.time}</div>
              </div>
              <div>
                <button className="btn-blue" onClick={()=>checkIn(r.id)}>Check in</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12, display:'flex', justifyContent:'flex-start'}}>
          <button className="button" onClick={()=>navigate('/receptionist/nextday')}>Next day's visitors</button>
        </div>
      </Card>
    </div>
  )
}
