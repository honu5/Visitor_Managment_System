import React, { useState } from 'react'
import Card from '../../components/Card'

export default function Secratery(){
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const host = (()=>{
    try{ return JSON.parse(localStorage.getItem('vms_host')||'null') }catch(e){ return null }
  })()

  async function send(e){
    e.preventDefault()
    setError('')
    setSuccess('')

    const text = String(message || '').trim()
    if(!text){
      setError('Message is required')
      return
    }

    if(!host?.id){
      setError('You must be logged in as host')
      return
    }

    try{
      const res = await fetch('/api/host/secratery',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ hostId: host.id, message: text })
      })
      const data = await res.json()
      if(!res.ok || data?.error){
        setError(data?.error || 'Failed to send message')
        return
      }
      setSuccess('Message sent to secratery')
      setMessage('')
    }catch(err){
      setError('Network error')
    }
  }

  return (
    <div className="wide-card">
      <h2>Secratery</h2>
      <Card style={{width:'100%'}}>
        <form onSubmit={send} style={{display:'grid',gap:12,maxWidth:1200,width:'100%'}}>
          <div className="form-row" style={{marginBottom:0}}>
            <label className="form-label" style={{display:'block'}}>Notice</label>
            <textarea
              className="form-input"
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              placeholder="Write an instruction for the secratery"
              rows={6}
              style={{minHeight:140, resize:'vertical'}}
            />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button className="button" type="submit">Send</button>
          </div>
        </form>
        {error && <div style={{marginTop:12,color:'#a00'}}>{error}</div>}
        {success && <div style={{marginTop:12,color:'#064'}}>{success}</div>}
      </Card>
    </div>
  )
}
