import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { createReceptionistAppointment, fetchReceptionistHosts } from '../../api/receptionistApi'

const FALLBACK_HOSTS = [
  { id: 'liranso392@gmail.com', name: 'Dawit Habtamu', email: 'liranso392@gmail.com' },
  { id: 'honelignyohannes1@gmail.com', name: 'Honelign Yohannes', email: 'honelignyohannes1@gmail.com' },
  { id: 'liranso111@gmail.com', name: 'Pauwlos Betsegaw', email: 'liranso111@gmail.com' }
]

export default function MakeAppointment(){
  const nav = useNavigate()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [phone,setPhone] = useState('')
  const [desc,setDesc] = useState('')
  const [type,setType] = useState('visitor')
  const [hosts,setHosts] = useState([])
  const [hostId,setHostId] = useState('')
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        const h = await fetchReceptionistHosts()
        const list = Array.isArray(h) ? h : []
        if(list.length){
          setHosts(list)
          if(!hostId) setHostId(String(list[0].id))
        } else {
          // If backend returns no hosts (e.g. DB empty), keep UI usable with known demo hosts.
          setHosts(FALLBACK_HOSTS)
          if(!hostId) setHostId(String(FALLBACK_HOSTS[0].id))
        }
      }catch(e){
        console.error(e)
        setHosts(FALLBACK_HOSTS)
        if(!hostId) setHostId(String(FALLBACK_HOSTS[0].id))
        setError('Failed to load hosts')
      }
    }
    load()
  },[])

  async function submit(e){
    e.preventDefault()
    setError('')
    setSuccess('')
    try{
      const selected = (hosts || []).find(h => String(h.id) === String(hostId))
      const hostIdNum = Number(hostId)
      const payload = {
        name,
        email,
        phone,
        description: desc,
        visitorType: type,
        ...(Number.isNaN(hostIdNum) ? { hostEmail: selected?.email || String(hostId || ''), hostName: selected?.name || '' } : { hostId: hostIdNum })
      }
      const res = await createReceptionistAppointment(payload)
      if(res?.error){ setError(res.error); return }
      setSuccess('Appointment created')
      setTimeout(()=>nav('/receptionist/visitors'), 600)
    }catch(e){
      console.error(e)
      setError('Failed to create appointment')
    }
  }

  return (
    <div>
      <h2>Make Appointment</h2>
      <Card>
        <form onSubmit={submit} style={{display:'grid',gap:12,maxWidth:680}}>
          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Visitor Type</label>
            <select className="form-input" value={type} onChange={e=>setType(e.target.value)}>
              <option value="visitor">Visitor</option>
              <option value="contractor">Contractor</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div>
            <label className="form-label">Host</label>
            <select className="form-input" value={hostId} onChange={e=>setHostId(e.target.value)}>
              {hosts.map(h=> <option key={h.id} value={String(h.id)}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input" value={desc} onChange={e=>setDesc(e.target.value)} />
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button type="button" className="button" onClick={()=>nav(-1)}>Cancel</button>
            <button className="make-appointment-button" type="submit">Create appointment</button>
          </div>
        </form>

        {error && <div style={{marginTop:12,color:'#a00'}}>{error}</div>}
        {success && <div style={{marginTop:12,color:'#064'}}>{success}</div>}
      </Card>
    </div>
  )
}
