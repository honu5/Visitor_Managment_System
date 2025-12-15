import React, {useState, useEffect} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createAppointment } from '../../api/visitorApi'
import Card from '../../components/Card'

function useQuery(){
  return new URLSearchParams(useLocation().search)
}

export default function VisitorAppointments(){
  const navigate = useNavigate()
  const query = useQuery()
  const hostName = query.get('host_name') || ''
  const hostId = query.get('host_id') || ''

  const [form,setForm]=useState({fullName:'',email:'',phone:'',description:'',visitorType:'Guest'})
  const [result,setResult]=useState(null)
  const [success,setSuccess]=useState(null)

  useEffect(()=>{
    // if no host specified, redirect to host list
    if(!hostName){
      navigate('/visitor/appointments')
    }
  },[hostName,navigate])

  async function submit(e){
    e.preventDefault()
    const payload = {...form, hostId, hostName}
    try{
      const res = await createAppointment(payload)
      setResult(res)
      setSuccess('Appointment submitted — you will be notified when the host accepts it.')

      const now = new Date().toISOString()
      const note = {id: `local-${Date.now()}`, message: `Appointment request sent to ${hostName}. You will be notified when the host accepts it.`, time: now}
      const existing = JSON.parse(localStorage.getItem('vms_notifications') || '[]')
      existing.unshift(note)
      localStorage.setItem('vms_notifications', JSON.stringify(existing))

      setTimeout(()=>navigate('/visitor/notifications'),1200)
    }catch(err){
      setSuccess('Failed to submit appointment. Try again.')
    }
  }

  return (
    <div>
      <h2>Appointment for {hostName}</h2>
      <Card>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Full name</label><input className="form-input" required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Email</label><input className="form-input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Phone</label><input className="form-input" required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Visitor type</label>
            <select className="form-input" value={form.visitorType} onChange={e=>setForm({...form,visitorType:e.target.value})}>
              <option>Guest</option>
              <option>Contractor</option>
              <option>Interview Candidate</option>
              <option>Delivery</option>
              <option>Maintenance</option>
            </select>
          </div>

          <div style={{marginTop:12}}>
            <button className="button" type="submit">Submit appointment</button>
          </div>
        </form>

        {success && <div style={{marginTop:12,padding:10,background:'#e6ffef',border:'1px solid #c9f3d8',borderRadius:6}}>{success}</div>}
        {result && <pre style={{marginTop:12}}>{JSON.stringify(result,null,2)}</pre>}
      </Card>
    </div>
  )
}
