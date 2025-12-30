const API_BASE = ''
export async function loginVisitor(payload){
  const res = await fetch('/api/visitor/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  return res.json()
}

export async function fetchAppointments(){
  const res = await fetch(`${API_BASE}/appointments`)
  return res.json()
}
export async function createAppointment(data){
  const res = await fetch(`${API_BASE}/appointments`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)
  })
  return res.json()
}
export async function fetchVisitorHistory(){
  const res = await fetch(`${API_BASE}/api/visitor/history`)
  return res.json()
}
export async function fetchVisitorNotifications(){
  const email = arguments.length && arguments[0] ? arguments[0].email : ''
  const qs = email ? `?email=${encodeURIComponent(email)}` : ''
  const res = await fetch(`${API_BASE}/api/visitor/notifications${qs}`)
  return res.json()
}
