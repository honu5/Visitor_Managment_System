import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchAnalytics } from '../../api/adminApi'

export default function AdminAnalytics(){
  const {data,loading} = useFetch(fetchAnalytics,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Admin - Analytics</h2>
      <pre>{JSON.stringify(data,null,2)}</pre>
    </div>
  )
}
