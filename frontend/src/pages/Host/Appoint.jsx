import React, {useState} from 'react'
import { createHostAppointment } from '../../api/hostApi'
import { useNavigate } from 'react-router-dom'

export default function HostAppoint(){
  const [form,setForm] = useState({name:'',email:''})
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const navigate = useNavigate()
  const host = (()=>{ try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){ return null } })()

  function buildScheduledAtISO(){
    if(!scheduleDate || !scheduleTime) return null
    const isoLike = `${scheduleDate}T${scheduleTime}:00`
    const dt = new Date(isoLike)
    if(Number.isNaN(dt.getTime())) return null
    return dt.toISOString()
  }

  async function submit(e){
    e.preventDefault()
    setError('')
    setSuccess('')
    try{
      if(!host?.id){
        setError('Please login as host first.')
        return
      }
      const scheduledAt = buildScheduledAtISO()
      if(!scheduledAt){
        setError('Please select a valid date and time.')
        return
      }
      const payload = {
        hostId: host.id,
        fullName: form.name,
        email: form.email,
        scheduledAt
      }
      const res = await createHostAppointment(payload)
      if(res?.error){
        setError(res.error)
        return
      }
      window.dispatchEvent(new Event('vms_schedule_changed'))
      setSuccess('Appointment created')
      setTimeout(()=>navigate('/host/schedule'), 600)
    }catch(e){
      setError('Failed to create appointment')
    }
  }

  return (
    <div>
      <h2>Create Appointment</h2>
      <div className="card" style={{maxWidth:600}}>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Visitor Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div className="form-row"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>

          <div style={{marginTop:8}}>
            <strong>Schedule appointment</strong>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
              <div className="form-row" style={{marginBottom:0}}>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} required />
              </div>
              <div className="form-row" style={{marginBottom:0}}>
                <label className="form-label">Time</label>
                <input className="form-input" type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} required />
              </div>
            </div>
          </div>

          <button className="button">Create</button>
          {error && <div style={{marginTop:10,color:'#a00'}}>{error}</div>}
          {success && <div style={{marginTop:10,color:'#064'}}>{success}</div>}
        </form>
      </div>
    </div>
  )
}
