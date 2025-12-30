import React, { useState } from 'react'
import Card from '../../components/Card'
import { fetchKioskAppointment, kioskCheckIn, kioskCheckOut } from '../../api/kioskApi'

function prettyStatus(s){
  const v = String(s || '').toLowerCase()
  if(!v) return ''
  return v.charAt(0).toUpperCase() + v.slice(1)
}

export default function KioskStatus(){
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [info, setInfo] = useState('')

  async function submit(e){
    e && e.preventDefault()
    setError('')
    setSelected(null)
    setInfo('')
    const term = String(q || '').trim()
    if(!term){
      setRows([])
      setError('Please enter your appointment id (e.g. A-17)')
      return
    }
    try{
      const res = await fetchKioskAppointment(term)
      if(res?.error){
        setRows([])
        setError(res.error)
        return
      }
      setRows([res])
    }catch(err){
      setRows([])
      setError('Failed to fetch status')
    }
  }

  async function doCheckIn(r){
    setError('')
    setInfo('')
    try{
      const term = r.publicId || r.email
      const res = await kioskCheckIn(term)
      if(res?.error) return setError(res.error)
      setInfo('Checked in')
      setSelected({...r, status: 'checked-in'})
      setRows([ {...r, status:'checked-in'} ])
    }catch(err){
      console.error(err)
      setError('Failed to check in')
    }
  }

  async function doCheckOut(r){
    setError('')
    setInfo('')
    try{
      const term = r.publicId || r.email
      const res = await kioskCheckOut(term)
      if(res?.error) return setError(res.error)
      setInfo('Checked out')
      setSelected({...r, status: 'checked-out'})
      setRows([ {...r, status:'checked-out'} ])
    }catch(err){
      console.error(err)
      setError('Failed to check out')
    }
  }

  return (
    <div>
      <h2>Kiosk — Status</h2>
      <Card>
        <form onSubmit={submit}>
          <div className="form-row">
            <label className="form-label">Enter your appointment id</label>
            <input
              className="form-input"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="A-01"
            />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="button" type="submit">Search</button>
          </div>
        </form>
        {error && <div style={{marginTop:10,color:'#a00'}}>{error}</div>}
        {info && <div style={{marginTop:10,color:'#064'}}>{info}</div>}
      </Card>

      {rows.length > 0 && (
        <Card>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {rows.map(r => (
              <div key={r.publicId || r.id} className="host-card" style={{cursor:'pointer'}} onClick={()=>setSelected(r)}>
                <div style={{fontWeight:700}}>{r.publicId || r.id} • {r.fullName}</div>
                <div style={{fontSize:13,color:'#666'}}>{r.host}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="floating-card" onClick={(e)=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setSelected(null)}>×</button>
            <h3 style={{marginTop:0}}>Appointment {selected.publicId || selected.id}</h3>
            <div style={{marginBottom:10}}><strong>Status:</strong> {prettyStatus(selected.status)}</div>
            <div><strong>Visitor:</strong> {selected.fullName}</div>
            <div><strong>Host:</strong> {selected.host}</div>
            <div><strong>Time:</strong> {selected.scheduledAt ? new Date(selected.scheduledAt).toLocaleString() : 'Not scheduled yet'}</div>
            {selected.description && <div style={{marginTop:10,color:'#444'}}><strong>Details:</strong> {selected.description}</div>}

            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button className="button" onClick={()=>doCheckIn(selected)} disabled={selected.status==='checked-in'}>Check in</button>
              <button className="button" onClick={()=>doCheckOut(selected)} disabled={selected.status==='checked-out'}>Check out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
