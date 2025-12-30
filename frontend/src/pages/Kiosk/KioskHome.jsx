import React, {useEffect, useMemo, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDepartmentHostData, createKioskAppointment } from '../../api/kioskApi'

export default function KioskHome(){
  const navigate = useNavigate()
  const [deptData,setDeptData]=useState([])
  const [dept,setDept]=useState('')
  const [hosts,setHosts]=useState([])
  const [hostKey,setHostKey]=useState('')
  const [form,setForm]=useState({fullName:'',email:'',phone:'',purpose:''})
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')

  const departmentNames = useMemo(() => {
    return (Array.isArray(deptData) ? deptData : [])
      .map(d => (typeof d === 'string' ? d : d?.name))
      .filter(Boolean)
  }, [deptData])

  const selectedHost = useMemo(() => {
    return (hosts || []).find(h => String(h.id) === String(hostKey) || String(h.email) === String(hostKey)) || null
  }, [hosts, hostKey])

  useEffect(()=>{
    fetchDepartmentHostData().then(data=>{
      const list = Array.isArray(data) ? data : []
      setDeptData(list)
      const first = list.find(x => x && typeof x === 'object' && x.name)?.name
      if(first && !dept) setDept(first)
    }).catch(()=>{
      setDeptData([])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    if(!dept){
      setHosts([])
      setHostKey('')
      return
    }
    const d = (Array.isArray(deptData) ? deptData : []).find(x => (typeof x === 'object' && x && x.name === dept))
    const list = Array.isArray(d?.hosts) ? d.hosts : []
    const normalized = list.map(h => ({ id: h.id, name: h.name, email: h.email }))
    setHosts(normalized)
    if(normalized.length){
      setHostKey(prev => prev || String(normalized[0].id || normalized[0].email || ''))
    } else {
      setHostKey('')
    }
  },[dept, deptData])

  async function submit(e){
    e.preventDefault()
    setError('')
    setResult(null)
    const fullName = String(form.fullName || '').trim()
    if(!fullName) return setError('Full name is required')
    if(!selectedHost) return setError('Please select a host')

    const payload = {
      fullName,
      email: String(form.email || '').trim(),
      phone: String(form.phone || '').trim(),
      description: String(form.purpose || '').trim(),
      visitorType: 'kiosk',
      department: dept,
      hostId: selectedHost.id,
      hostEmail: selectedHost.email,
      hostName: selectedHost.name
    }

    const res = await createKioskAppointment(payload)
    setResult(res)
    if(res?.error){
      setError(res.error)
      return
    }
    setTimeout(()=>navigate('/kiosk'),1000)
  }

  return (
    <div>
      <h2 style={{margin:0,marginBottom:12}}>Kiosk</h2>
      <div className="card">
        <div className="form-row">
          <label className="form-label">Department</label>
          <select className="form-input" value={dept} onChange={e=>setDept(e.target.value)}>
            <option value="">Select</option>
            {departmentNames.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label className="form-label">Host</label>
          <select className="form-input" value={hostKey} onChange={e=>setHostKey(e.target.value)}>
            <option value="">Select</option>
            {hosts.map(h=><option key={h.id || h.email} value={String(h.id || h.email)}>{h.name}</option>)}
          </select>
        </div>
        <form onSubmit={submit}>
          {['fullName','email','phone','purpose'].map(k=> (
            <div className="form-row" key={k}>
              <label className="form-label">{k}</label>
              <input className="form-input" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <button className="button" type="submit">Submit</button>
        </form>
        {error && <div style={{color:'#a00',marginTop:10}}>{error}</div>}
        {result && <pre>{JSON.stringify(result,null,2)}</pre>}
      </div>
    </div>
  )
}
