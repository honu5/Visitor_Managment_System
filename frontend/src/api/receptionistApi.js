const API_BASE = ''
export async function fetchReceptionistHosts(){
  const res = await fetch(`${API_BASE}/api/receptionist/hosts`)
  return res.json()
}
export async function fetchHostScheduleForReceptionist(id){
  const res = await fetch(`${API_BASE}/api/receptionist/hosts/${id}/schedule`)
  return res.json()
}
export async function createReceptionistAppointment(payload){
  const res = await fetch(`${API_BASE}/api/receptionist/appointments`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
  })
  return res.json()
}
export async function fetchReceptionistVisitors(){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/upcoming`)
  return res.json()
}
export async function fetchReceptionistNotifications(){
  const res = await fetch(`${API_BASE}/api/receptionist/notifications`)
  return res.json()
}
