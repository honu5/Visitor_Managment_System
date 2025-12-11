import React, {useState} from 'react'
import { useFetch } from '../../hooks/useApi'
import { fetchHostSchedule, blockHostTime } from '../../api/hostApi'
import SimpleTable from '../../components/Tables/SimpleTable'

export default function HostSchedule(){
  const {data,loading} = useFetch(fetchHostSchedule,[])
  const [block,setBlock] = useState({start:'',end:'',reason:''})
  async function doBlock(e){
    e.preventDefault()
    await blockHostTime(block)
    alert('Blocked (request sent)')
  }
  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h2>Host Schedule</h2>
      <SimpleTable columns={["date","time","visitorName","status"]} data={data || []} />
      <div className="card">
        <h3>Block Time</h3>
        <form onSubmit={doBlock}>
          <div className="form-row"><label>Start</label><input value={block.start} onChange={e=>setBlock({...block,start:e.target.value})} /></div>
          <div className="form-row"><label>End</label><input value={block.end} onChange={e=>setBlock({...block,end:e.target.value})} /></div>
          <div className="form-row"><label>Reason</label><input value={block.reason} onChange={e=>setBlock({...block,reason:e.target.value})} /></div>
          <button className="button">Block</button>
        </form>
      </div>
    </div>
  )
}
