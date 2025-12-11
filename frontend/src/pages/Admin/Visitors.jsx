import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchAdminVisitors } from '../../api/adminApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function AdminVisitors(){
  const {data,loading} = useFetch(fetchAdminVisitors,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Admin - Visitors</h2>
      <SimpleTable columns={["id","fullName","email","phone"]} data={data||[]} />
    </div>
  )
}
