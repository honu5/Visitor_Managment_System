import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchHostNotifications } from '../../api/hostApi'

export default function HostNotifications(){
  const {data,loading} = useFetch(fetchHostNotifications,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Host Notifications</h2>
      <ul>{(data||[]).map((n,i)=>(<li key={i}>{n.message ?? JSON.stringify(n)}</li>))}</ul>
    </div>
  )
}
