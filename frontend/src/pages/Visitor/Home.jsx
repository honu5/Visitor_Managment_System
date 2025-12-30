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
        <div style={{display:'flex',justifyContent:'center'}}>
          <div style={{width:'75%',display:'flex',flexDirection:'column',gap:12}}>
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

  // Departments row taking 75% width centered
  return (
    <div>
      <h2>Departments</h2>
      <div style={{display:'flex',justifyContent:'center'}}>
        <div style={{width:'75%',display:'flex',flexDirection:'column',gap:12}}>
          {departments.map(d => (
            <Card key={d.name}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                <div style={{fontWeight:700}}>{d.name}</div>
                <button className="button" onClick={()=>onSelectDept(d)}>View hosts</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
