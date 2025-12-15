import React, {useState} from 'react'
import { createHostAppointment } from '../../api/hostApi'
import { useNavigate } from 'react-router-dom'

export default function HostAppoint(){
  const [form,setForm] = useState({name:'',time:'',email:''})
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    await createHostAppointment(form)
    alert('Appointment created')
    navigate('/host/schedule')
  }

  return (
    <div>
      <h2>Create Appointment</h2>
      <div className="card" style={{maxWidth:600}}>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Visitor Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div className="form-row"><label className="form-label">Time</label><input className="form-input" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} placeholder="2025-12-11 14:30" required /></div>
          <div className="form-row"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          <button className="button">Create</button>
        </form>
      </div>
    </div>
  )
}
