import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchHostHistory } from '../../api/hostApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function HostHistory(){
  const {data,loading} = useFetch(fetchHostHistory,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Host History</h2>
      <SimpleTable columns={["id","visitorName","date","time","status"]} data={data || []} />
    </div>
  )
}
