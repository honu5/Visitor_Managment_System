import React from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchReceptionistHosts, fetchHostScheduleForReceptionist } from '../../api/receptionistApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function HostsDashboard(){
  const {data:hosts,loading} = useFetch(fetchReceptionistHosts,[])
  const [schedule,setSchedule] = React.useState([])
  async function viewSchedule(id){
    const s = await fetchHostScheduleForReceptionist(id)
    setSchedule(s)
  }
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Receptionist - Hosts</h2>
      <SimpleTable columns={["id","name","department"]} data={hosts||[]} />
      <div className="card">
        <h3>Host Schedule (click to load)</h3>
        <div>
          {(hosts||[]).map(h=>(<button key={h.id} className="button" style={{margin:6}} onClick={()=>viewSchedule(h.id)}>{h.name}</button>))}
        </div>
        <SimpleTable columns={["date","time","visitorName","status"]} data={schedule||[]} />
      </div>
    </div>
  )
}
