import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'

export default function VisitorHome(){
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/api/visitor/home')
        const data = await res.json()
        setDepartments(data)
      }catch(err){
        console.error(err)
      }finally{ setLoading(false) }
    }
    load()
  },[])

  function goToHost(h){
    const params = new URLSearchParams({ host_name: h.name, host_id: h.id })
    navigate('/visitor/appointment?' + params.toString())
  }

  function onSelectDept(d){
    setSelectedDept(d.name)
    const params = new URLSearchParams({ department: d.name })
    navigate('/visitor/home?' + params.toString())
  }

  function hostPosition(h){
    const map = {
      'liranso392@gmail.com': 'CEO',
      'honelignyohannes1@gmail.com': 'Technical leader',
      'liranso111@gmail.com': 'Secretary'
    }
    return map[h.email] || 'Staff'
  }

  if(loading) return <div>Loading departments...</div>

  const urlParams = new URLSearchParams(window.location.search)
  const deptQuery = urlParams.get('department')

  if(deptQuery){
    const dept = departments.find(d => d.name === deptQuery)
    return (
      <div>
        <h2>Hosts — {dept?.name || deptQuery}</h2>
        <div>
          <div className="host-list">
            {(dept?.hosts||[]).map(h=> (
              <Card key={h.id}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  <div>
                    <h3 style={{marginTop:0,marginBottom:6}}>{h.name}</h3>
                    <div style={{fontSize:12,color:'#666'}}>{hostPosition(h)}</div>
                  </div>
                  <div>
                    <button className="button" onClick={()=>goToHost(h)}>Book</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Departments displayed as responsive card grid
  const descriptions = {
    'Human resource': 'Employee relations, hiring and onboarding services.',
    'IT': 'Information technology and systems support.',
    'Customer service': 'Customer inquiries and support services.',
    'Logistics': 'Supply chain and transport coordination.',
    'Administrative office': 'General administrative and office services.'
  }

  return (
    <div>
      <h2>Departments</h2>
      <div className="department-grid">
        {(departments||[]).slice(0,5).map(d => (
          <div key={d.id} className="department-card slide-up">
            <div>
              <h3>{d.name}</h3>
              <p>{descriptions[d.name] || 'Department services and contacts.'}</p>
            </div>
            <div className="enter-row">
              <button className="enter-btn" onClick={()=>onSelectDept(d)}>View Hosts</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
