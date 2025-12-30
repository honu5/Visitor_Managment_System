import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useApi'
import { fetchAdminHosts, createAdminHost, updateAdminHost, deleteAdminHost, fetchDepartments } from '../../api/adminApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function AdminHosts(){
  const navigate = useNavigate()
  const {data,loading} = useFetch(fetchAdminHosts,[])
  const [departments,setDepartments] = useState([])
  const [form,setForm] = useState({name:'',email:'',departmentId:''})
  const [editing,setEditing] = useState(null)

  useEffect(()=>{
    fetchDepartments().then(setDepartments).catch(()=>setDepartments([]))
  },[])

  async function submit(e){
    e.preventDefault();
    await createAdminHost({
      name: form.name,
      email: form.email,
      departmentId: form.departmentId ? Number(form.departmentId) : null
    })
    navigate('/admin/hosts')
  }

  async function startEdit(row){
    setEditing({ id: row.id, name: row.name || '', email: row.email || '', departmentId: row.departmentId || '' })
  }

  async function saveEdit(e){
    e.preventDefault()
    if(!editing) return
    await updateAdminHost(editing.id, {
      name: editing.name,
      email: editing.email,
      departmentId: editing.departmentId ? Number(editing.departmentId) : null
    })
    setEditing(null)
    navigate('/admin/hosts')
  }

  async function remove(row){
    if(!window.confirm('Delete this host?')) return
    await deleteAdminHost(row.id)
    navigate('/admin/hosts')
  }

  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Admin - Hosts</h2>
      <div className="card">
        <table className="table simple-table">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>email</th>
              <th>department</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {(data||[]).map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.department}</td>
                <td style={{display:'flex',gap:8}}>
                  <button className="btn-blue" type="button" onClick={()=>startEdit(row)}>Edit</button>
                  <button className="btn-red" type="button" onClick={()=>remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="card">
          <h3>Edit Host</h3>
          <form onSubmit={saveEdit}>
            <div className="form-row"><label className="form-label">Name</label><input className="form-input" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></div>
            <div className="form-row"><label className="form-label">Email</label><input className="form-input" value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></div>
            <div className="form-row">
              <label className="form-label">Department</label>
              <select className="form-input" value={editing.departmentId || ''} onChange={e=>setEditing({...editing,departmentId:e.target.value})}>
                <option value="">Select department</option>
                {(departments||[]).map(d=> (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-green" type="submit">Save</button>
              <button className="button" type="button" onClick={()=>setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Create Host</h3>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div className="form-row"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          <div className="form-row">
            <label className="form-label">Department</label>
            <select className="form-input" value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}>
              <option value="">Select department</option>
              {(departments||[]).map(d=> (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>
          <button className="button">Create</button>
        </form>
      </div>
    </div>
  )
}
