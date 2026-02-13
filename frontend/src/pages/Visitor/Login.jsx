import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import { loginVisitor } from '../../api/visitorApi'

export default function VisitorLogin(){
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError('')
    const raw = String(phone || '').trim()
    // validate Ethiopian phone: 10 digits, numeric only, starts with 09 or 07
    if(!/^[0-9]{10}$/.test(raw) || !(raw.startsWith('09') || raw.startsWith('07'))){
      return setError("You don't have the correct form of the Ethiopian Phone number")
    }
    try{
      const res = await loginVisitor({ phone: raw })
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
        <h3 style={{marginTop:0}}>Visitor — Enter your phone number</h3>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Ethiopian phone (starts with 09 or 07)</label>
            <input className="form-input" required value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,''))} placeholder="09XXXXXXXX" maxLength={10} />
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
