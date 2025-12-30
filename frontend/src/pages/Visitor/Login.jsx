import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { loginVisitor } from '../../api/visitorApi'

export default function VisitorLogin(){
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError('')
    if(!username) return setError('Please enter a username')
    try{
      const res = await loginVisitor({ username })
      if(res && !res.error){
        localStorage.setItem('vms_visitor', JSON.stringify(res))
        navigate('/visitor/home')
      }else{
        setError(res.error || 'Failed to login')
      }
    }catch(err){
      setError('Network error')
    }
  }

  return (
    <div style={{display:'flex',justifyContent:'center',marginTop:48}}>
      <Card style={{width:420}}>
        <h3 style={{marginTop:0}}>Visitor — Enter your username</h3>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Username</label>
            <input className="form-input" required value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div style={{marginTop:12}}>
            <button className="button" type="submit">Continue</button>
          </div>
          {error && <div style={{marginTop:8,color:'#a00'}}>{error}</div>}
        </form>
      </Card>
    </div>
  )
}
