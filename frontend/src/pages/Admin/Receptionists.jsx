import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchAdminReceptionists } from '../../api/adminApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function AdminReceptionists(){
  const {data,loading} = useFetch(fetchAdminReceptionists,[])
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Admin - Receptionists</h2>
      <SimpleTable columns={["id","name","department"]} data={data||[]} />
    </div>
  )
}
