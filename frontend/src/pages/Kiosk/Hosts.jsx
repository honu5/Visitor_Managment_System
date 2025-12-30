import React, {useEffect, useState} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchHostsByDept } from '../../api/kioskApi'
import Card from '../../components/Card'

function useQuery(){ return new URLSearchParams(useLocation().search) }

export default function KioskHosts(){
  const query = useQuery()
  const dept = query.get('dept') || ''
  const [hosts,setHosts] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    if(!dept) return
    fetchHostsByDept(dept).then(d=>setHosts(d||[])).catch(()=>setHosts([]))
  },[dept])

  return (
    <div>
      <h2>Hosts — {dept}</h2>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {hosts.map(h=> (
            <div key={h.id} className="host-card" style={{cursor:'pointer'}} onClick={()=>navigate(`/kiosk/book?host_id=${h.id}&host_name=${encodeURIComponent(h.name)}`)}>
              <div style={{fontWeight:700}}>{h.name}</div>
              <div style={{fontSize:13,color:'#666'}}>{h.department}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
