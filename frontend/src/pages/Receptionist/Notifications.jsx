import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchReceptionistNotifications } from '../../api/receptionistApi'

export default function ReceptionistNotifications(){
  const {data,loading} = useFetch(fetchReceptionistNotifications,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Receptionist Notifications</h2>
      <ul>{(data||[]).map((n,i)=>(<li key={i}>{n.message ?? JSON.stringify(n)}</li>))}</ul>
    </div>
  )
}
