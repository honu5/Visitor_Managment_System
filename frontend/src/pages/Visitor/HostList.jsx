import React from 'react'
import { useNavigate } from 'react-router-dom'

const DEPARTMENT = 'Human Resource'
const HOSTS = [
  {id: 'h1', name: 'Gemechu Getahun', title: 'Director'},
  {id: 'h2', name: 'Honelign Yohannes', title: 'Manager'},
  {id: 'h3', name: 'Teshale Mekuria', title: 'CEO'},
  {id: 'h4', name: 'Abdu Hassen', title: 'Project Lead'},
  {id: 'h5', name: 'Tsion Abate', title: 'Developer'},
  {id: 'h6', name: 'Amanuel Tadesse', title: 'HR Specialist'},
  {id: 'h7', name: 'Dawit Bekele', title: 'Coordinator'}
]

export default function HostList(){
  const navigate = useNavigate()

  function goToForm(h){
    const params = new URLSearchParams({host_name: h.name, host_id: h.id})
    navigate('/visitor/appointment?' + params.toString())
  }

  return (
    <div>
      <h2 className="dept-header">Department: {DEPARTMENT}</h2>
      <div className="card host-list">
        {HOSTS.map(h => (
          <div key={h.id} className="host-item" onClick={()=>goToForm(h)}>
            <strong>{h.name}</strong>
            <div style={{fontSize:12,color:'#666'}}>{h.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
