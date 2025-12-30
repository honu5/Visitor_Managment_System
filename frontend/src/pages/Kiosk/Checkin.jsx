import React, {useState} from 'react'
import Card from '../../components/Card'
import { kioskCheckIn } from '../../api/kioskApi'

export default function KioskCheckin(){
  const [q,setQ] = useState('')
  const [msg,setMsg] = useState('')
  const [error,setError] = useState('')

  async function submit(e){
    e && e.preventDefault()
    setMsg('')
    setError('')
    const term = String(q||'').trim()
    if(!term) return setError('Please enter an appointment id or email')
    try{
      const res = await kioskCheckIn(term)
      if(res?.error) return setError(res.error)
      setMsg('Your check in has been recorded. Please proceed to the host.')
      setQ('')
    }catch(err){
      console.error(err)
      setError('Failed to check in')
    }
  }

  return (
    <div>
      <h2>Kiosk — Check in</h2>
      <Card>
        <form onSubmit={submit}>
          <div className="form-row"><label className="form-label">Enter your appointment id or email</label>
            <input className="form-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="A-01 or your email" />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="button" type="submit">Check in</button>
          </div>
        </form>
        {msg && <div style={{marginTop:10,color:'#064'}}>{msg}</div>}
        {error && <div style={{marginTop:10,color:'#a00'}}>{error}</div>}
      </Card>
    </div>
  )
}
