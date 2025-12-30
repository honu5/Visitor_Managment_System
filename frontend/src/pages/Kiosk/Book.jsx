import React, {useMemo, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { createKioskAppointment } from '../../api/kioskApi'

const DEPARTMENTS = [
  'Human resource',
  'IT',
  'Customer service',
  'Logistics',
  'Administrative office'
]

const HOSTS = [
  { name: 'Dawit Habtamu', email: 'liranso392@gmail.com' },
  { name: 'Honelign Yohannes', email: 'honelignyohannes1@gmail.com' },
  { name: 'Pauwlos Betsegaw', email: 'liranso111@gmail.com' }
]

export default function KioskBook(){
  const nav = useNavigate()
  const [dept, setDept] = useState(DEPARTMENTS[0])
  const [hostEmail, setHostEmail] = useState(HOSTS[0]?.email || '')
  const hostName = useMemo(() => (HOSTS.find(h => h.email === hostEmail)?.name || ''), [hostEmail])

  const [form,setForm] = useState({fullName:'',email:'',phone:'',purpose:'',time:''})
  const [error,setError] = useState('')
  const [msg,setMsg] = useState('')

  async function submit(e){
    e.preventDefault()
    setError('')
    setMsg('')

    const fullName = String(form.fullName || '').trim()
    const email = String(form.email || '').trim()
    const phone = String(form.phone || '').trim()
    const purpose = String(form.purpose || '').trim()
    const time = String(form.time || '').trim()

    if(!fullName) return setError('Visitor full name is required')
    if(!hostEmail) return setError('Please select a host')

    const description = [
      purpose ? `Purpose: ${purpose}` : '',
      time ? `Preferred time: ${time}` : '',
      dept ? `Department: ${dept}` : ''
    ].filter(Boolean).join(' | ')

    try{
      const res = await createKioskAppointment({
        fullName,
        email,
        phone,
        description,
        visitorType: 'kiosk',
        hostEmail,
        hostName
      })

      if(res?.error) return setError(res.error)
      const id = res?.appointment?.id
      setMsg(id ? `Appointment request created. Appointment ID: #${id}` : 'Appointment request created.')
      setForm({fullName:'',email:'',phone:'',purpose:'',time:''})
    }catch(err){
      console.error(err)
      setError('Failed to create appointment')
    }
  }

  return (
    <div>
      <h2>Kiosk — Make appointment request</h2>
      <Card>
        <form onSubmit={submit} style={{display:'grid',gap:10,maxWidth:640}}>
          <div className="form-row">
            <label className="form-label">Department</label>
            <select className="form-input" value={dept} onChange={e=>setDept(e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Host</label>
            <select className="form-input" value={hostEmail} onChange={e=>setHostEmail(e.target.value)}>
              {HOSTS.map(h => <option key={h.email} value={h.email}>{h.name}</option>)}
            </select>
            {hostName && <div style={{fontSize:12,color:'#666',marginTop:4}}>Selected: {hostName}</div>}
          </div>

          <div className="form-row"><label className="form-label">Visitor full name</label><input className="form-input" required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Purpose</label><input className="form-input" value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} /></div>

          <div className="form-row"><label className="form-label">Preferred time (optional)</label><input className="form-input" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} /></div>

          {error && <div style={{color:'#a00'}}>{error}</div>}
          {msg && <div style={{color:'#064'}}>{msg}</div>}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button type="button" className="button" onClick={()=>nav(-1)}>Cancel</button>
            <button className="make-appointment-button" type="submit">Create</button>
          </div>
        </form>
      </Card>
    </div>
  )
}
