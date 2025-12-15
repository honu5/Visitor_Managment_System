const API_BASE = ''
export async function fetchDepartments(){
  const res = await fetch(`${API_BASE}/departments`)
  return res.json()
}
export async function fetchHostsByDept(dept){
  const res = await fetch(`${API_BASE}/hosts/department/${dept}`)
  return res.json()
}
export async function createKioskAppointment(data){
  const res = await fetch(`${API_BASE}/appointments/kiosk`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)
  })
  return res.json()
}
