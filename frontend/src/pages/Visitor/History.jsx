import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchVisitorHistory } from '../../api/visitorApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function VisitorHistory(){
  const {data,loading} = useFetch(fetchVisitorHistory,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Visitor History</h2>
      <SimpleTable columns={["id","fullName","date","time","status"]} data={data || []} />
    </div>
  )
}
