import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function useQuery(){ return new URLSearchParams(useLocation().search) }

export default function HostList(){
  const navigate = useNavigate()
  const query = useQuery()
  const deptId = query.get('dept_id') || ''
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        setError('')
        const res = await fetch('/api/departments')
        const json = await res.json()
        if(!res.ok){
          setError(json?.error || 'Failed to load departments')
          setDepartments([])
          return
        }
        setDepartments(Array.isArray(json) ? json : [])
      }catch(e){
        console.error(e)
        setError('Failed to load departments')
        setDepartments([])
      }
    }
    load()
  },[])

  function goToForm(h){
    const params = new URLSearchParams({ host_name: h.name, host_id: String(h.id), host_email: h.email || '' })
    navigate('/visitor/appointment?' + params.toString())
  }

  const descriptions = {
    'Human resource': 'Employee relations, hiring and onboarding.',
    'IT': 'Information technology and systems support.',
    'Customer service': 'Customer inquiries and support services.',
    'Logistics': 'Supply chain and transport coordination.',
    'Administrative office': 'General administrative and office services.'
  }

  if(deptId){
    const dept = departments.find(d => String(d.id)===String(deptId))
    const hosts = dept?.hosts || []
    return (
      <div>
        <h2 className="dept-header">{dept?.name || 'Hosts'}</h2>
        <div style={{marginBottom:12}}>
          <button className="button" onClick={()=>navigate('/visitor/appointments')}>Back to departments</button>
        </div>
        <div className="card host-list">
          {hosts.length===0 && <div style={{color:'#666'}}>No hosts in this department</div>}
          {hosts.map(h => (
            <div key={h.id} className="host-item fade-in" onClick={()=>goToForm(h)}>
              <strong>{h.name}</strong>
              <div style={{fontSize:12,color:'#666'}}>{h.email}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="dept-header">Departments</h2>

      {error && (
        <div className="card" style={{marginBottom:12,color:'#a00'}}>
          {error}
        </div>
      )}

      <div className="department-grid">
        {(departments||[]).slice(0,5).map(d => (
          <div key={d.id} className="department-card slide-up">
            <div>
              <h3>{d.name}</h3>
              <p>{descriptions[d.name] || 'Department services and contacts.'}</p>
            </div>
            <div className="enter-row">
              <button className="enter-btn" onClick={()=>navigate(`/visitor/appointments?dept_id=${d.id}`)}>Enter</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
