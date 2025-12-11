import React, {useState} from 'react'
import { createAppointment } from '../../api/visitorApi'
import Card from '../../components/Card'

export default function VisitorAppointments(){
  const [form,setForm]=useState({fullName:'',email:'',phone:'',purpose:'',date:'',time:''})
  const [result,setResult]=useState(null)
  async function submit(e){
    e.preventDefault()
    const res = await createAppointment(form)
    setResult(res)
  }
  return (
    <div>
      <h2>Make an Appointment (Visitor)</h2>
      <Card>
        <form onSubmit={submit}>
          {['fullName','email','phone','purpose','date','time'].map(k=> (
            <div className="form-row" key={k}>
              <label>{k}</label><br/>
              <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <button className="button" type="submit">Submit</button>
        </form>
        {result && <pre>{JSON.stringify(result,null,2)}</pre>}
      </Card>
    </div>
  )
}
