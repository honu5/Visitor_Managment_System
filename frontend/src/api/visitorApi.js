const API_BASE = ''
export async function fetchAppointments(){
  const res = await fetch(`${API_BASE}/public/appointments`)
  return res.json()
}
export async function createAppointment(data){
  const res = await fetch(`${API_BASE}/public/appointments`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)
  })
  return res.json()
}
export async function fetchVisitorHistory(){
  const res = await fetch(`${API_BASE}/api/visitor/history`)
  return res.json()
}
export async function fetchVisitorNotifications(){
  const res = await fetch(`${API_BASE}/api/visitor/notifications`)
  return res.json()
}
