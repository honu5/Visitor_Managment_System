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

export async function fetchReceptionistTodayVisitors(limit=3){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/today?limit=${encodeURIComponent(limit)}`)
  return res.json()
}

export async function fetchReceptionistOnsiteVisitors(){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/onsite`)
  return res.json()
}

export async function fetchReceptionistNextDayVisitors(){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/nextday`)
  return res.json()
}

export async function fetchReceptionistHistoryVisitors(limit=100){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/history?limit=${encodeURIComponent(limit)}`)
  return res.json()
}

export async function receptionistCheckIn(id){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/${id}/checkin`,{ method:'POST' })
  return res.json()
}

export async function receptionistCheckOut(id){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/${id}/checkout`,{ method:'POST' })
  return res.json()
}

export async function receptionistDelay(id, scheduledAt){
  const res = await fetch(`${API_BASE}/api/receptionist/visitors/${id}/delay`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ scheduledAt })
  })
  return res.json()
}
export async function fetchReceptionistNotifications(){
  const res = await fetch(`${API_BASE}/api/receptionist/notifications`)
  return res.json()
}
