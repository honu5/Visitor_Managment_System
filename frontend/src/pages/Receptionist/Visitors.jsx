import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchReceptionistVisitors } from '../../api/receptionistApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function ReceptionistVisitors(){
  const {data,loading} = useFetch(fetchReceptionistVisitors,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Receptionist - Incoming Visitors</h2>
      <SimpleTable columns={["id","fullName","department","hostName","date","time"]} data={data||[]} />
    </div>
  )
}
