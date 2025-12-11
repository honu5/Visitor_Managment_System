import React, {useState, useEffect} from 'react'
import { fetchDepartments, fetchHostsByDept, createKioskAppointment } from '../../api/kioskApi'

export default function KioskHome(){
  const [departments,setDepartments]=useState([])
  const [dept,setDept]=useState('')
  const [hosts,setHosts]=useState([])
  const [host,setHost]=useState('')
  const [form,setForm]=useState({fullName:'',phone:'',purpose:'',date:'',time:''})
  const [result,setResult]=useState(null)

  useEffect(()=>{ fetchDepartments().then(d=>setDepartments(d||[])).catch(()=>setDepartments([])) },[])
  useEffect(()=>{ if(dept) fetchHostsByDept(dept).then(d=>setHosts(d||[])).catch(()=>setHosts([])) },[dept])

  async function submit(e){
    e.preventDefault()
    const payload = {...form,hostId:host,department:dept}
    const res = await createKioskAppointment(payload)
    setResult(res)
  }

  return (
    <div>
      <h2>Kiosk</h2>
      <div className="card">
        <div className="form-row">
          <label>Department</label>
          <select value={dept} onChange={e=>setDept(e.target.value)}>
            <option value="">Select</option>
            {departments.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Host</label>
          <select value={host} onChange={e=>setHost(e.target.value)}>
            <option value="">Select</option>
            {hosts.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <form onSubmit={submit}>
          {['fullName','phone','purpose','date','time'].map(k=> (
            <div className="form-row" key={k}>
              <label>{k}</label><br/>
              <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <button className="button" type="submit">Submit</button>
        </form>
        {result && <pre>{JSON.stringify(result,null,2)}</pre>}
      </div>
    </div>
  )
}
