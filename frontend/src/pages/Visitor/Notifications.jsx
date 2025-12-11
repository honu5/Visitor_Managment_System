import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchVisitorNotifications } from '../../api/visitorApi'

export default function VisitorNotifications(){
  const {data,loading} = useFetch(fetchVisitorNotifications,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Visitor Notifications</h2>
      <ul>
        {(data||[]).map((n,i)=>(<li key={i}>{n.message ?? JSON.stringify(n)}</li>))}
      </ul>
    </div>
  )
}
