const API_BASE = ''
export async function fetchHostSchedule(){
  const res = await fetch(`${API_BASE}/api/host/schedule`)
  return res.json()
}
export async function blockHostTime(payload){
  const res = await fetch(`${API_BASE}/api/host/block-time`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
  })
  return res.json()
}
export async function fetchHostHistory(){
  const res = await fetch(`${API_BASE}/api/host/history`)
  return res.json()
}
export async function fetchHostNotifications(){
  const res = await fetch(`${API_BASE}/api/host/notifications`)
  return res.json()
}
