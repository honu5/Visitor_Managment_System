const API_BASE = ''
export async function fetchAdminHosts(){
  const res = await fetch(`${API_BASE}/api/admin/hosts`)
  return res.json()
}
export async function createAdminHost(payload){
  const res = await fetch(`${API_BASE}/api/admin/hosts`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  return res.json()
}
export async function fetchAdminReceptionists(){
  const res = await fetch(`${API_BASE}/api/admin/receptionists`)
  return res.json()
}
export async function fetchAdminVisitors(){
  const res = await fetch(`${API_BASE}/api/admin/visitors`)
  return res.json()
}
export async function fetchAnalytics(){
  const res = await fetch(`${API_BASE}/api/admin/analytics`)
  return res.json()
}
