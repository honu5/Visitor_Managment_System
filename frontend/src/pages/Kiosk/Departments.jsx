import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDepartments } from '../../api/kioskApi'
import Card from '../../components/Card'

export default function KioskDepartments(){
  const [depts,setDepts] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    fetchDepartments().then(d=>setDepts(d||[])).catch(()=>setDepts([]))
  },[])

  return (
    <div>
      <h2>Departments</h2>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
          {depts.map(d=> (
            <div key={d} className="host-card" style={{cursor:'pointer'}} onClick={()=>navigate(`/kiosk/hosts?dept=${encodeURIComponent(d)}`)}>
              <div style={{fontWeight:700}}>{d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
