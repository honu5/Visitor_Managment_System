const API_BASE = ''
export async function fetchDepartmentHostData(){
  const res = await fetch(`${API_BASE}/api/visitor/home`)
  return res.json()
}

// Existing callers expect an array of department names (strings)
export async function fetchDepartments(){
  const data = await fetchDepartmentHostData()
  if(!Array.isArray(data)) return []
  return data
    .map(d => (typeof d === 'string' ? d : d?.name))
    .filter(Boolean)
}

// Existing callers expect an array of hosts for a department
export async function fetchHostsByDept(dept){
  const data = await fetchDepartmentHostData()
  if(!Array.isArray(data)) return []
  const d = data.find(x => (typeof x === 'object' && x && x.name === dept))
  const hosts = d?.hosts
  return Array.isArray(hosts) ? hosts : []
}
export async function createKioskAppointment(data){
  const res = await fetch(`${API_BASE}/appointments/kiosk`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)
  })
  return res.json()
}

export async function fetchKioskAppointment(term){
  const res = await fetch(`${API_BASE}/api/kiosk/appointment?term=${encodeURIComponent(term)}`)
  return res.json()
}

export async function kioskCheckIn(term){
  const res = await fetch(`${API_BASE}/api/kiosk/checkin`,{ method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ term }) })
  return res.json()
}

export async function kioskCheckOut(term){
  const res = await fetch(`${API_BASE}/api/kiosk/checkout`,{ method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ term }) })
  return res.json()
}
