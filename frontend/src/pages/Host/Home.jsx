import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'

function Home() {
  const navigate = useNavigate()
  const today = new Date()

  const [next, setNext] = useState([])
  const [pending, setPending] = useState([])

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [host, setHost] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){return null}
  })

  useEffect(()=>{
    async function loadHostData(){
      if(!host) return
      try{
        const tRes = await fetch(`/api/host/upcoming?hostId=${host.id}&limit=3`)
        const upcoming = await tRes.json()
        setNext(upcoming)
        const pRes = await fetch(`/api/host/pending?hostId=${host.id}`)
        const pend = await pRes.json()
        setPending(pend.slice(0,3))
      }catch(e){ console.error(e) }
    }
    loadHostData()
  },[host])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })

  async function login(e){
    e.preventDefault()
    setError('')
    try{
      const res = await fetch('/api/host/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
      const data = await res.json()
      if(!res.ok){
        setError(data.message || 'Login failed')
        return
      }
      if(data?.host){
        setHost(data.host)
        localStorage.setItem('vms_host',JSON.stringify(data.host))
      }
    }catch(err){
      setError('Network error')
    }
  }

  function logout(){
    setHost(null)
    localStorage.removeItem('vms_host')
  }

  // If not logged in, show floating login card
  if(!host){
    return (
      <div>
        <div style={{display:'flex',justifyContent:'center',marginTop:48}}>
          <Card style={{width:420}}>
            <h3 style={{marginTop:0}}>Host login</h3>
            <p>Enter your email to continue. For demo use the two host emails provided by the system.</p>
            <form onSubmit={login}>
              <div className="form-row"><label className="form-label">Email</label>
                <input className="form-input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div style={{marginTop:12}}>
                <button className="button" type="submit">Login</button>
              </div>
              {error && <div style={{marginTop:8,color:'#a00'}}>{error}</div>}
            </form>
            <div style={{marginTop:12,fontSize:13,color:'#666'}}>
              Demo hosts: <br/> liranso392@gmail.com (Daniel Mekurian - Human Resource)<br/> honelignyohannes1@gmail.com (Honelign Yohannes - IT Department)
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="wide-card">
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
          <div style={{fontSize:20,fontWeight:700}}>{host.fullName}</div>
          <div>
            <button className="button" onClick={logout} style={{height:34}}>Logout</button>
          </div>
        </div>
        <div className="host-dashboard-date">
          {today.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className="host-home-grid">
        <div>
          <Card>
            <h3 style={{ marginTop: 0 }}>Next 3 Appointments</h3>
            <div className="next-appointments-row">
              {next.map(a=> (
                <div key={a.id} className="next-appointment-card">
                  <div style={{fontWeight:700}}>{a.fullName || a.visitor?.username || a.visitor?.name}</div>
                  <div style={{fontSize:13,color:'#666'}}>{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 style={{ marginTop: 0 }}>Pending</h3>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {pending.map(p=> (
                <div key={p.id} className="host-card" style={{minWidth:180}}>
                  <div className="title">{p.fullName}</div>
                  <div style={{fontSize:12,color:'#666'}}>{p.description || p.visitorType || ''}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
              <button className="button" onClick={()=>navigate('/host/pending')}>See more pending</button>
            </div>
          </Card>
        </div>

        <div>
          <Card style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
            <h3 style={{ marginTop: 0, textAlign:'center' }}>Actions</h3>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:8,flexDirection:'column',gap:10}}>
              <button className="make-appointment-button" onClick={()=>navigate('/host/appoint')} style={{width:220,height:44,justifyContent:'center',padding:'10px 14px'}}>
                <span style={{fontSize:20,lineHeight:1}}>+</span> Make appointment
              </button>
              <button className="button" onClick={()=>navigate('/host/secratery')} style={{width:220,height:44}}>
                Secratery
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
