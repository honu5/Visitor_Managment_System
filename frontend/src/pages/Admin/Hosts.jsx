import React, {useState} from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchAdminHosts, createAdminHost } from '../../api/adminApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function AdminHosts(){
  const {data,loading} = useFetch(fetchAdminHosts,[])
  const [form,setForm] = useState({name:'',department:''})
  async function submit(e){
    e.preventDefault();
    await createAdminHost(form);
    alert('Created (may need refresh)')
  }
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Admin - Hosts</h2>
      <SimpleTable columns={["id","name","department"]} data={data||[]} />
      <div className="card">
        <h3>Create Host</h3>
        <form onSubmit={submit}>
          <div className="form-row"><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div className="form-row"><label>Department</label><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} /></div>
          <button className="button">Create</button>
        </form>
      </div>
    </div>
  )
}
