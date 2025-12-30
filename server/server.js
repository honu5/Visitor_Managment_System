const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const { PrismaClient } = require('@prisma/client')

dotenv.config()
const prisma = new PrismaClient()
const app = express()
app.use(cors())
app.use(bodyParser.json())

const ACCEPTED_STATUSES = ['approved','accepted','checked-in','checked-out','delayed']
const DEMO_RECIPIENT_RECEPTIONIST = 'receptionist'
const DEMO_RECIPIENT_VISITOR = 'visitor'
const RECEPTIONIST_ARRIVING_STATUSES = ['approved','accepted','delayed']

const DEMO_DEPARTMENTS = [
  'Human resource',
  'IT',
  'Customer service',
  'Logistics',
  'Administrative office'
]

const DEMO_HOST_TEMPLATES = [
  { name: 'Dawit Habtamu', email: 'liranso392@gmail.com', building: 'New Building', officeNumber: '7' },
  { name: 'Honelign Yohannes', email: 'honelignyohannes1@gmail.com', building: 'New Building', officeNumber: '10' },
  { name: 'Pauwlos Betsegaw', email: 'liranso111@gmail.com', building: 'New Building', officeNumber: '15' }
]

const DEMO_RECEPTIONIST_TEMPLATES = [
  { name: 'Receptionist One', email: 'receptionist1@demo.local' },
  { name: 'Receptionist Two', email: 'receptionist2@demo.local' }
]

function normalizeEmail(v){
  const s = String(v || '').trim().toLowerCase()
  return s
}

async function ensureDemoDepartment(name){
  const deptName = String(name || '').trim()
  if(!deptName) return null
  try{
    const existing = await prisma.department.findUnique({ where: { name: deptName } }).catch(()=>null)
    if(existing) return existing
    return await prisma.department.create({ data: { name: deptName } })
  }catch(e){
    console.warn('ensureDemoDepartment failed:', e?.message || e)
    return null
  }
}

async function ensureDemoHost({ email, name, building, officeNumber }){
  const emailNorm = normalizeEmail(email)
  const hostName = String(name || '').trim()
  if(!emailNorm || !hostName) return null

  // If the host already exists anywhere, return it
  const existing = await prisma.host.findFirst({ where: { email: emailNorm }, orderBy: { id: 'asc' } }).catch(()=>null)
  if(existing){
    // best-effort: ensure office/building are filled
    const needsBuilding = !existing.building && building
    const needsOffice = !existing.officeNumber && officeNumber
    if(needsBuilding || needsOffice){
      await prisma.host.updateMany({
        where: { email: emailNorm },
        data: {
          ...(needsBuilding ? { building: String(building) } : {}),
          ...(needsOffice ? { officeNumber: String(officeNumber) } : {})
        }
      }).catch(()=>null)
    }
    return existing
  }

  // Create at least one department + host row for demo
  const dept = await ensureDemoDepartment(DEMO_DEPARTMENTS[0])
  try{
    return await prisma.host.create({
      data: {
        name: hostName,
        email: emailNorm,
        building: building ? String(building) : null,
        officeNumber: officeNumber ? String(officeNumber) : null,
        departmentId: dept?.id || null
      }
    })
  }catch(e){
    console.warn('ensureDemoHost failed:', e?.message || e)
    return null
  }
}

async function ensureDemoSeeded(){
  // Best-effort: create departments + demo hosts when DB is empty or missing hosts.
  try{
    // Always ensure demo departments/hosts exist (idempotent)
    for(const d of DEMO_DEPARTMENTS) await ensureDemoDepartment(d)
    for(const h of DEMO_HOST_TEMPLATES) await ensureDemoHost(h)

    // Seed a couple receptionists for demo (so admin screen isn't empty)
    if(prisma.receptionist){
      const anyRec = await prisma.receptionist.findFirst({ select: { id: true } }).catch(()=>null)
      if(!anyRec){
        const dept = await prisma.department.findFirst({ orderBy: { id: 'asc' } }).catch(()=>null)
        const deptId = dept?.id || null
        for(const r of DEMO_RECEPTIONIST_TEMPLATES){
          const emailNorm = normalizeEmail(r.email)
          const existing = await prisma.receptionist.findUnique({ where: { email: emailNorm } }).catch(()=>null)
          if(existing) continue
          await prisma.receptionist.create({ data: { name: r.name, email: emailNorm, departmentId: deptId } }).catch(()=>null)
        }
      }
    }
  }catch(e){
    console.warn('ensureDemoSeeded failed:', e?.message || e)
  }
}

function startOfWeek(d){
  const x = new Date(d)
  x.setHours(0,0,0,0)
  // Monday-based week
  const day = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - day)
  return x
}

function endOfWeek(d){
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(e.getDate() + 7)
  return e
}

function formatHostLocation(host){
  const b = String(host?.building || '').trim()
  const o = String(host?.officeNumber || '').trim()
  if(b && o) return `${b}, Office #${o}`
  if(b) return b
  if(o) return `Office #${o}`
  return ''
}

function formatArrivalNotice(){
  return 'Please arrive at least 30 minutes early. Late visitors may not be served.'
}

async function enforceReapplyCooldown({ hostId, visitorEmail }){
  const emailNorm = normalizeEmail(visitorEmail)
  if(!emailNorm) return

  const { hostIds } = await resolveHostGroup({ hostId })
  const ids = (hostIds && hostIds.length) ? hostIds : [Number(hostId)]
  const now = new Date()

  const active = await prisma.hostVisitorCooldown.findFirst({
    where: {
      hostId: { in: ids },
      visitorEmail: emailNorm,
      blockedUntil: { gt: now }
    },
    orderBy: { blockedUntil: 'desc' }
  }).catch(()=>null)

  if(active?.blockedUntil){
    const until = new Date(active.blockedUntil)
    const remainingDays = Math.max(1, Math.ceil((until.getTime() - now.getTime()) / (24*60*60*1000)))
    const untilText = until.toLocaleString()
    const err = new Error(`You can request another appointment with this host after ${untilText} (about ${remainingDays} day(s)).`)
    err.statusCode = 403
    throw err
  }
}

async function resolveHostGroup({ hostId, email }){
  let host = null
  if(hostId) host = await prisma.host.findUnique({ where: { id: Number(hostId) } })
  if(!host && email) host = await prisma.host.findFirst({ where: { email: String(email) }, orderBy: { id: 'asc' } })
  if(!host) return { host: null, hostIds: [] }

  const rows = await prisma.host.findMany({ where: { email: host.email }, select: { id: true } })
  const hostIds = (rows || []).map(r => r.id)
  return { host, hostIds }
}

// simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url)
  next()
})

// Host login: demo-only (fake Keycloak login gate)
app.post('/api/host/login', async (req, res) => {
  const { email, password } = req.body || {}
  if(!email) return res.status(400).json({ error: 'email required' })
  if(password === undefined || password === null || String(password).length === 0){
    return res.status(400).json({ error: 'password required' })
  }
  try{
    const emailNorm = normalizeEmail(email)

    // Demo requirement: only allow these two host emails, password must be 12345.
    const allowed = new Set([
      normalizeEmail('liranso392@gmail.com'),
      normalizeEmail('honelignyohannes1@gmail.com')
    ])
    if(!allowed.has(emailNorm) || String(password) !== '12345'){
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid username or password' })
    }

    // Make demo reliable: ensure the host row exists.
    const demo = DEMO_HOST_TEMPLATES.find(h => normalizeEmail(h.email) === emailNorm)
    if(demo) await ensureDemoHost(demo)

    const host = await prisma.host.findFirst({ where: { email: emailNorm }, orderBy: { id: 'asc' } })
    if(!host){
      return res.status(401).json({ error: 'Unauthorized', message: 'You are not authorized to access this application' })
    }
    // return host object in shape frontend expects
    return res.json({ host: { id: host.id, fullName: host.name, email: host.email, departmentId: host.departmentId } })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to login host' })
  }
})

// Host: pending requests
app.get('/api/host/pending', async (req, res) => {
  const { hostId, email } = req.query
  try{
    const { host, hostIds } = await resolveHostGroup({ hostId, email })
    const where = host ? { hostId: { in: hostIds }, status: 'pending' } : { status: 'pending' }
    const pending = await prisma.appointment.findMany({ where, orderBy: { createdAt: 'desc' }, include: { visitor: true, host: true } })
    res.json(pending)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch pending' })
  }
})

// Approve/reject pending
app.post('/api/host/pending/:id/approve', async (req, res) => {
  const id = Number(req.params.id)
  try{
    const { scheduledAt } = req.body || {}
    if(!scheduledAt){
      return res.status(400).json({ error: 'scheduledAt required (ISO string)' })
    }
    const when = new Date(scheduledAt)
    if(Number.isNaN(when.getTime())){
      return res.status(400).json({ error: 'scheduledAt must be a valid date/time' })
    }

    const apptBefore = await prisma.appointment.findUnique({ where: { id } })
    if(!apptBefore){
      return res.status(404).json({ error: 'appointment not found' })
    }

    const { host: apptHost, hostIds: hostGroupIds } = await resolveHostGroup({ hostId: apptBefore.hostId })
    const hostIdsToUse = (hostGroupIds && hostGroupIds.length) ? hostGroupIds : [apptBefore.hostId]

    // enforce blocks at hour-granularity
    const hourStart = new Date(when)
    hourStart.setMinutes(0,0,0)
    const hourEnd = new Date(hourStart)
    hourEnd.setHours(hourEnd.getHours()+1)
    const block = await prisma.hostBlock.findFirst({ where: { hostId: { in: hostIdsToUse }, startAt: hourStart } }).catch(()=>null)
    if(block){
      return res.status(409).json({ error: 'The time is blocked. Select another time or unblock it.' })
    }

    const collision = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        hostId: { in: hostIdsToUse },
        status: { in: ACCEPTED_STATUSES },
        scheduledAt: { gte: hourStart, lt: hourEnd }
      }
    })
    if(collision){
      return res.status(409).json({ error: 'Another appointment is already scheduled in that time slot.' })
    }

    // assign a public appointment id like A-01, A-02 when approving
    async function generatePublicId(){
      const count = await prisma.appointment.count({ where: { publicId: { startsWith: 'A-' } } })
      const next = count + 1
      return `A-${String(next).padStart(2,'0')}`
    }

    const pubId = await generatePublicId()
    const appt = await prisma.appointment.update({
      where: { id },
      data: { status: 'approved', scheduledAt: when, publicId: pubId }
    })

    // notify visitor by email (include arrival notice + host office/building)
    const dateTimeText = when.toLocaleString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })
    const locationLine = ' Location: New Building Office #7.'
    const message = `Good news! Your appointment ${appt.publicId ? `(${appt.publicId}) ` : ''}is approved for ${dateTimeText}. ${formatArrivalNotice()}${locationLine}`
    await prisma.notification.create({ data: { recipientEmail: normalizeEmail(appt.email), message } }).catch(()=>null)

    // demo visitor endpoint (not user-specific)
    await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_VISITOR, message } }).catch(()=>null)

    // notify receptionist (single demo receptionist, not user-specific)
    const hostName = apptHost?.name || 'Host'
    const receptionistMessage = `${hostName} approved appointment ${appt.publicId} for ${appt.fullName} at ${dateTimeText}.`
    await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_RECEPTIONIST, message: receptionistMessage } }).catch(()=>null)

    // keep demo visitor bucket concise as well
    const visitorMessageWithId = `Your appointment ${appt.publicId} is approved for ${dateTimeText}. ${formatArrivalNotice()}${locationLine}`
    await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_VISITOR, message: visitorMessageWithId } }).catch(()=>null)

    res.json({ success: true, appointment: appt })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to approve' }) }
})
app.post('/api/host/pending/:id/reject', async (req, res) => {
  const id = Number(req.params.id)
  try{
    const cooldownDaysRaw = req.body?.cooldownDays
    const cooldownDays = Number(cooldownDaysRaw)
    if(!Number.isFinite(cooldownDays) || Number.isNaN(cooldownDays) || cooldownDays < 0){
      return res.status(400).json({ error: 'cooldownDays (number of days) required' })
    }

    const apptBefore = await prisma.appointment.findUnique({ where: { id } })
    if(!apptBefore) return res.status(404).json({ error: 'appointment not found' })

    const appt = await prisma.appointment.update({ where: { id }, data: { status: 'rejected', scheduledAt: null } })

    const visitorEmail = normalizeEmail(apptBefore.email)
    if(visitorEmail){
      const { host: apptHost, hostIds } = await resolveHostGroup({ hostId: apptBefore.hostId })
      const ids = (hostIds && hostIds.length) ? hostIds : [apptBefore.hostId]
      const now = new Date()
      const blockedUntil = new Date(now.getTime() + Math.round(cooldownDays) * 24*60*60*1000)

      for(const hostId of ids){
        await prisma.hostVisitorCooldown.upsert({
          where: { hostId_visitorEmail: { hostId: Number(hostId), visitorEmail } },
          update: { blockedUntil },
          create: { hostId: Number(hostId), visitorEmail, blockedUntil }
        }).catch(()=>null)
      }

      const apptIdBold = `**#${apptBefore.id}**`
      const untilText = blockedUntil.toLocaleString()
      const locationText = formatHostLocation(apptHost)
      const locationLine = locationText ? ` Location: ${locationText}.` : ''
      const message = `Your appointment request ${apptIdBold} was rejected. You can make a new request again after ${untilText} (${Math.round(cooldownDays)} day(s) from now).${locationLine}`

      await prisma.notification.create({ data: { recipientEmail: visitorEmail, message } }).catch(()=>null)
      await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_VISITOR, message } }).catch(()=>null)
    }

    res.json({ success: true, appointment: appt })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to reject' }) }
})

// Host blocks: list blocks in a date range
app.get('/api/host/blocks', async (req, res) => {
  const { hostId, from, to } = req.query
  if(!hostId) return res.status(400).json({ error: 'hostId required' })
  const fromDate = from ? new Date(from) : new Date(Date.now() - 7*24*60*60*1000)
  const toDate = to ? new Date(to) : new Date(Date.now() + 14*24*60*60*1000)
  if(Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())){
    return res.status(400).json({ error: 'from/to must be valid ISO dates' })
  }
  try{
    const { hostIds } = await resolveHostGroup({ hostId })
    const ids = (hostIds && hostIds.length) ? hostIds : [Number(hostId)]
    const blocks = await prisma.hostBlock.findMany({
      where: { hostId: { in: ids }, startAt: { gte: fromDate, lte: toDate } },
      orderBy: { startAt: 'asc' }
    })
    res.json(blocks)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch blocks' }) }
})

// Host blocks: toggle a block for an hour slot
app.post('/api/host/block-time', async (req, res) => {
  const { hostId, startAt } = req.body || {}
  if(!hostId || !startAt) return res.status(400).json({ error: 'hostId and startAt required' })
  const dt = new Date(startAt)
  if(Number.isNaN(dt.getTime())) return res.status(400).json({ error: 'startAt must be a valid ISO date' })

  const hourStart = new Date(dt)
  hourStart.setMinutes(0,0,0)
  const hourEnd = new Date(hourStart)
  hourEnd.setHours(hourEnd.getHours()+1)

  try{
    const { hostIds } = await resolveHostGroup({ hostId })
    const ids = (hostIds && hostIds.length) ? hostIds : [Number(hostId)]

    // don't allow blocking if an appointment already scheduled in this hour
    const existingAppt = await prisma.appointment.findFirst({
      where: {
        hostId: { in: ids },
        status: { in: ACCEPTED_STATUSES },
        scheduledAt: { gte: hourStart, lt: hourEnd }
      }
    })
    if(existingAppt){
      return res.status(409).json({ error: 'This slot already has an approved appointment.' })
    }

    const existing = await prisma.hostBlock.findFirst({ where: { hostId: { in: ids }, startAt: hourStart } })
    if(existing){
      await prisma.hostBlock.deleteMany({ where: { hostId: { in: ids }, startAt: hourStart } })
      return res.json({ success: true, blocked: false, startAt: hourStart })
    }
    await prisma.hostBlock.createMany({ data: ids.map(id => ({ hostId: id, startAt: hourStart })), skipDuplicates: true })
    return res.json({ success: true, blocked: true, startAt: hourStart })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to toggle block' }) }
})

// Host today (appointments for today)
app.get('/api/host/today', async (req, res) => {
  const { hostId, email } = req.query
  try{
    const { host, hostIds } = await resolveHostGroup({ hostId, email })
    const ids = (host && hostIds.length) ? hostIds : (host ? [host.id] : [])

    const start = new Date(); start.setHours(0,0,0,0)
    const end = new Date(); end.setHours(23,59,59,999)
    const where = {
      ...(host ? { hostId: { in: ids } } : {}),
      status: { in: ACCEPTED_STATUSES },
      scheduledAt: { gte: start, lte: end }
    }
    const appts = await prisma.appointment.findMany({ where, orderBy: { scheduledAt: 'asc' }, include: { visitor: true, host: true } })
    res.json(appts)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch today' }) }
})

// Host upcoming (next N approved appointments)
app.get('/api/host/upcoming', async (req, res) => {
  const { hostId, email, limit } = req.query
  const take = Math.min(Math.max(Number(limit) || 3, 1), 20)
  try{
    const { host, hostIds } = await resolveHostGroup({ hostId, email })
    const ids = (host && hostIds.length) ? hostIds : (host ? [host.id] : [])

    const now = new Date()
    const where = {
      ...(host ? { hostId: { in: ids } } : {}),
      status: { in: ACCEPTED_STATUSES },
      scheduledAt: { gte: now }
    }
    const appts = await prisma.appointment.findMany({ where, orderBy: { scheduledAt: 'asc' }, take, include: { visitor: true, host: true } })
    res.json(appts)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch upcoming' }) }
})

// Host schedule (approved appointments within a range)
app.get('/api/host/schedule', async (req, res) => {
  const { hostId, email, from, to } = req.query
  try{
    const { host, hostIds } = await resolveHostGroup({ hostId, email })
    const ids = (host && hostIds.length) ? hostIds : (host ? [host.id] : [])

    const fromDate = from ? new Date(from) : new Date(Date.now() - 7*24*60*60*1000)
    const toDate = to ? new Date(to) : new Date(Date.now() + 14*24*60*60*1000)
    if(Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())){
      return res.status(400).json({ error: 'from/to must be valid ISO dates' })
    }

    const where = {
      ...(host ? { hostId: { in: ids } } : {}),
      status: { in: ACCEPTED_STATUSES },
      scheduledAt: { not: null, gte: fromDate, lte: toDate }
    }
    const appts = await prisma.appointment.findMany({ where, orderBy: { scheduledAt: 'asc' }, include: { visitor: true, host: true } })
    res.json(appts)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch schedule' }) }
})

// Host notifications
app.get('/api/host/notifications', async (req, res) => {
  const { hostId, email } = req.query
  try{
    const { host, hostIds } = await resolveHostGroup({ hostId, email })
    const ids = (host && hostIds.length) ? hostIds : (host ? [host.id] : [])

    const where = host ? { hostId: { in: ids } } : {}
    const appts = await prisma.appointment.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20, include: { host: true } })
    const apptNotes = appts.map(n => ({ id: `appt-${n.id}`, message: `Appointment from ${n.fullName} is ${n.status}`, time: n.createdAt }))

    const hostRecipientEmails = []
    if(host?.email){
      const raw = String(host.email)
      const norm = normalizeEmail(raw)
      hostRecipientEmails.push(raw)
      if(norm && norm !== raw) hostRecipientEmails.push(norm)
    }
    const dbNotes = host && hostRecipientEmails.length
      ? await prisma.notification.findMany({ where: { recipientEmail: { in: hostRecipientEmails } }, orderBy: { createdAt: 'desc' }, take: 30 })
      : []
    const mappedDb = (dbNotes||[]).map(n => ({ id: `note-${n.id}`, message: n.message, time: n.createdAt, deletable: true }))

    const combined = [...mappedDb, ...apptNotes].sort((a,b)=> new Date(b.time) - new Date(a.time))
    res.json(combined)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch notifications' }) }
})

// Host delete a DB notification (only for note-* items)
app.delete('/api/host/notifications/:id', async (req, res) => {
  const { hostId, email } = req.query
  const rawId = String(req.params.id || '')
  const numericId = Number(rawId.startsWith('note-') ? rawId.slice('note-'.length) : rawId)
  if(!numericId || Number.isNaN(numericId)) return res.status(400).json({ error: 'invalid notification id' })
  try{
    let host = null
    if(hostId) host = await prisma.host.findUnique({ where: { id: Number(hostId) } })
    if(!host && email) host = await prisma.host.findFirst({ where: { email } })
    if(!host) return res.status(401).json({ error: 'Unauthorized' })

    const note = await prisma.notification.findUnique({ where: { id: numericId } })
    if(!note) return res.status(404).json({ error: 'notification not found' })
    if(note.recipientEmail !== host.email) return res.status(403).json({ error: 'Not allowed' })

    await prisma.notification.delete({ where: { id: numericId } })
    res.json({ success: true })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to delete notification' }) }
})

// Host reschedule an approved appointment
app.post('/api/host/appointments/:id/reschedule', async (req, res) => {
  const id = Number(req.params.id)
  const { scheduledAt, hostId } = req.body || {}
  if(!scheduledAt) return res.status(400).json({ error: 'scheduledAt required (ISO string)' })
  const when = new Date(scheduledAt)
  if(Number.isNaN(when.getTime())) return res.status(400).json({ error: 'scheduledAt must be a valid date/time' })

  try{
    const appt = await prisma.appointment.findUnique({ where: { id }, include: { host: true } })
    if(!appt) return res.status(404).json({ error: 'appointment not found' })
  const { hostIds } = await resolveHostGroup({ hostId: appt.hostId })
  const ids = (hostIds && hostIds.length) ? hostIds : [appt.hostId]

    if(hostId && appt.hostId !== Number(hostId)){
      return res.status(403).json({ error: 'Not allowed to reschedule this appointment' })
    }

    if(!ACCEPTED_STATUSES.includes(appt.status)){
      return res.status(400).json({ error: 'Only approved appointments can be rescheduled' })
    }

    const hourStart = new Date(when)
    hourStart.setMinutes(0,0,0)
    const hourEnd = new Date(hourStart)
    hourEnd.setHours(hourEnd.getHours()+1)

    const block = await prisma.hostBlock.findFirst({ where: { hostId: { in: ids }, startAt: hourStart } }).catch(()=>null)
    if(block){
      return res.status(409).json({ error: 'The time is blocked. Select another time or unblock it.' })
    }

    const collision = await prisma.appointment.findFirst({
      where: {
        id: { not: appt.id },
        hostId: { in: ids },
        status: { in: ACCEPTED_STATUSES },
        scheduledAt: { gte: hourStart, lt: hourEnd }
      }
    })
    if(collision){
      return res.status(409).json({ error: 'Another appointment is already scheduled in that time slot.' })
    }

    const updated = await prisma.appointment.update({ where: { id }, data: { scheduledAt: when, rescheduledAt: new Date() } })

    const oldText = appt.scheduledAt ? new Date(appt.scheduledAt).toLocaleString() : 'unscheduled'
    const newText = when.toLocaleString()
    const message = `Appointment rescheduled: ${appt.fullName} from ${oldText} to ${newText}`
    if(appt.host?.email){
      await prisma.notification.create({ data: { recipientEmail: appt.host.email, message } }).catch(()=>null)
    }

    if(appt.email){
      const visitorMessage = `Your appointment has been rescheduled to ${newText}.`
      await prisma.notification.create({ data: { recipientEmail: appt.email, message: visitorMessage } }).catch(()=>null)
    }

    res.json({ success: true, appointment: updated })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to reschedule' }) }
})

// Host history
app.get('/api/host/history', async (req, res) => {
  const { hostId, email } = req.query
  try{
    const { host, hostIds } = await resolveHostGroup({ hostId, email })
    const ids = (host && hostIds.length) ? hostIds : (host ? [host.id] : [])
    const where = {
      ...(host ? { hostId: { in: ids } } : {}),
      status: { in: ACCEPTED_STATUSES },
      scheduledAt: { not: null }
    }
    const appts = await prisma.appointment.findMany({ where, orderBy: { scheduledAt: 'desc' }, include: { visitor: true, host: true } })
    res.json(appts)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch history' }) }
})

// Host create appointment directly (approved + scheduled)
app.post('/api/host/appointment', async (req, res) => {
  const { hostId, fullName, email, phone, description, visitorType, scheduledAt } = req.body || {}
  if(!hostId || !fullName || !email || !scheduledAt){
    return res.status(400).json({ error: 'hostId, fullName, email, scheduledAt required' })
  }
  const when = new Date(scheduledAt)
  if(Number.isNaN(when.getTime())) return res.status(400).json({ error: 'scheduledAt must be a valid date/time' })

  // enforce blocks at hour-granularity
  const hourStart = new Date(when)
  hourStart.setMinutes(0,0,0)
  const { hostIds } = await resolveHostGroup({ hostId })
  const ids = (hostIds && hostIds.length) ? hostIds : [Number(hostId)]
  const block = await prisma.hostBlock.findFirst({ where: { hostId: { in: ids }, startAt: hourStart } }).catch(()=>null)
  if(block){
    return res.status(409).json({ error: 'The time is blocked. Select another time or unblock it.' })
  }

  try{
    const emailNorm = normalizeEmail(email)
    let visitor = await prisma.visitor.findUnique({ where: { email: emailNorm } })
    if(!visitor){
      visitor = await prisma.visitor.create({ data: { username: fullName, email: emailNorm } })
    }

    const appt = await prisma.appointment.create({
      data: {
        hostId: Number(hostId),
        fullName,
        email: emailNorm,
        phone: phone || null,
        description: description || null,
        visitorType: visitorType || null,
        visitorId: visitor.id,
        source: 'host',
        status: 'approved',
        scheduledAt: when
      }
    })

    const dateTimeText = when.toLocaleString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })
    const message = `Good news your appointment is accepted for ${dateTimeText}. Please be there before 30 minutes of approvements late visitor may not be served`
    await prisma.notification.create({ data: { recipientEmail: emailNorm, message } }).catch(()=>null)

    res.json({ success: true, appointment: appt })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to create host appointment' }) }
})

const PORT = process.env.PORT || 5000

// ---------------- Receptionist API ----------------

function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x }
function endOfDay(d){ const x = new Date(d); x.setHours(23,59,59,999); return x }

app.get('/api/receptionist/hosts', async (req, res) => {
  try{
    const rows = await prisma.host.findMany({ include: { department: true }, orderBy: { id: 'asc' } })
    // De-dupe by email so receptionist doesn't see many duplicates due to seeding per department
    const byEmail = new Map()
    for(const h of rows){
      if(!byEmail.has(h.email)){
        byEmail.set(h.email, { id: h.id, name: h.name, department: h.department?.name || '' })
      }
    }
    res.json(Array.from(byEmail.values()))
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch hosts' }) }
})

app.get('/api/receptionist/hosts/:id/schedule', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid host id' })
  try{
    const { hostIds } = await resolveHostGroup({ hostId: id })
    const ids = (hostIds && hostIds.length) ? hostIds : [id]

    const from = req.query.from ? new Date(String(req.query.from)) : startOfDay(new Date())
    const to = req.query.to ? new Date(String(req.query.to)) : endOfDay(new Date(Date.now() + 7*24*60*60*1000))
    if(Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return res.status(400).json({ error: 'from/to must be valid dates' })

    const appts = await prisma.appointment.findMany({
      where: { hostId: { in: ids }, status: { in: ACCEPTED_STATUSES }, scheduledAt: { not: null, gte: from, lte: to } },
      orderBy: { scheduledAt: 'asc' }
    })
    const mapped = appts.map(a => ({
      id: a.id,
      date: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0,10) : '',
      time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '',
      visitorName: a.fullName,
      status: a.status
    }))
    res.json(mapped)
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch host schedule' }) }
})

app.get('/api/receptionist/visitors/onsite', async (req, res) => {
  try{
    const now = new Date()
    const appts = await prisma.appointment.findMany({
      where: { status: 'checked-in', scheduledAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      orderBy: { scheduledAt: 'asc' },
      include: { host: true }
    })
    res.json(appts.map(a => ({ id: a.id, name: a.fullName, host: a.host?.name || '', status: a.status, scheduledAt: a.scheduledAt })))
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch onsite visitors' }) }
})

app.get('/api/receptionist/visitors/today', async (req, res) => {
  const take = Math.min(Math.max(Number(req.query.limit) || 3, 1), 50)
  try{
    const now = new Date()
    const appts = await prisma.appointment.findMany({
      where: { status: { in: RECEPTIONIST_ARRIVING_STATUSES }, scheduledAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      orderBy: { scheduledAt: 'asc' },
      take,
      include: { host: true }
    })
    res.json(appts.map(a => ({
      id: a.id,
      name: a.fullName,
      host: a.host?.name || '',
      time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '',
      status: a.status,
      scheduledAt: a.scheduledAt
    })))
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch today visitors' }) }
})

app.get('/api/receptionist/visitors/upcoming', async (req, res) => {
  const take = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200)
  try{
    const now = new Date()
    const appts = await prisma.appointment.findMany({
      where: { status: { in: RECEPTIONIST_ARRIVING_STATUSES }, scheduledAt: { not: null, gte: now } },
      orderBy: { scheduledAt: 'asc' },
      take,
      include: { host: true }
    })
    res.json(appts.map(a => ({
      id: a.id,
      name: a.fullName,
      host: a.host?.name || '',
      date: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0,10) : '',
      time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '',
      status: a.status,
      scheduledAt: a.scheduledAt
    })))
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch upcoming visitors' }) }
})

app.get('/api/receptionist/visitors/nextday', async (req, res) => {
  try{
    const tomorrow = new Date(Date.now() + 24*60*60*1000)
    const appts = await prisma.appointment.findMany({
      where: { status: { in: RECEPTIONIST_ARRIVING_STATUSES }, scheduledAt: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) } },
      orderBy: { scheduledAt: 'asc' },
      include: { host: true }
    })
    res.json(appts.map(a => ({
      id: a.id,
      name: a.fullName,
      host: a.host?.name || '',
      date: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0,10) : '',
      time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '',
      status: a.status
    })))
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to fetch next day visitors' }) }
})

app.post('/api/receptionist/visitors/:id/checkin', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid appointment id' })
  try{
    const appt = await prisma.appointment.update({ where: { id }, data: { status: 'checked-in' }, include: { host: true } })
    res.json({ success: true, appointment: appt })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to check in' }) }
})

app.post('/api/receptionist/visitors/:id/checkout', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid appointment id' })
  try{
    const appt = await prisma.appointment.update({ where: { id }, data: { status: 'checked-out' }, include: { host: true } })
    res.json({ success: true, appointment: appt })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to check out' }) }
})

// Receptionist history (checked-out appointments)
app.get('/api/receptionist/visitors/history', async (req, res) => {
  const take = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500)
  try{
    const appts = await prisma.appointment.findMany({
      where: { status: 'checked-out' },
      orderBy: { createdAt: 'desc' },
      take,
      include: { host: true }
    })
    res.json(appts.map(a => ({
      id: a.id,
      name: a.fullName,
      host: a.host?.name || '',
      date: a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0,10) : '',
      time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '',
      status: a.status,
      scheduledAt: a.scheduledAt
    })))
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch history visitors' })
  }
})

app.post('/api/receptionist/visitors/:id/delay', async (req, res) => {
  const id = Number(req.params.id)
  const { scheduledAt } = req.body || {}
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid appointment id' })
  if(!scheduledAt) return res.status(400).json({ error: 'scheduledAt required' })
  const when = new Date(scheduledAt)
  if(Number.isNaN(when.getTime())) return res.status(400).json({ error: 'scheduledAt must be a valid date/time' })

  try{
    const appt = await prisma.appointment.findUnique({ where: { id }, include: { host: true } })
    if(!appt) return res.status(404).json({ error: 'appointment not found' })

    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'delayed', scheduledAt: when, rescheduledAt: new Date() } })

    const whenText = when.toLocaleString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })
    if(appt.email){
      await prisma.notification.create({ data: { recipientEmail: appt.email, message: `Your appointment was delayed to ${whenText}.` } }).catch(()=>null)
    }
    if(appt.host?.email){
      await prisma.notification.create({ data: { recipientEmail: appt.host.email, message: `Appointment delayed: ${appt.fullName} to ${whenText}` } }).catch(()=>null)
    }

    res.json({ success: true, appointment: updated })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to delay appointment' }) }
})

app.post('/api/receptionist/appointments', async (req, res) => {
  const { name, fullName, email, phone, description, visitorType, hostId, hostEmail, hostName, scheduledAt } = req.body || {}
  const visitorName = fullName || name
  if(!visitorName || (!hostId && !hostEmail && !hostName)){
    return res.status(400).json({ error: 'name (or fullName) and hostId/hostEmail/hostName required' })
  }
  if(scheduledAt){
    const when = new Date(scheduledAt)
    if(Number.isNaN(when.getTime())) return res.status(400).json({ error: 'scheduledAt must be a valid date/time' })
  }

  try{
    await ensureDemoSeeded()

    let visitor = null
    if(email){
      const emailNorm = normalizeEmail(email)
      visitor = await prisma.visitor.findUnique({ where: { email: emailNorm } })
      if(!visitor){
        visitor = await prisma.visitor.create({ data: { username: visitorName, email: emailNorm, phone: phone || null } })
      }
    }

    // Resolve host from id/email/name
    let hostConnectId = null
    let hostRow = null
    if(hostId && !Number.isNaN(Number(hostId))){
      hostRow = await prisma.host.findUnique({ where: { id: Number(hostId) } }).catch(()=>null)
      if(hostRow) hostConnectId = hostRow.id
    }
    if(!hostConnectId && hostEmail){
      const emailNorm = normalizeEmail(hostEmail)
      hostRow = await prisma.host.findFirst({ where: { email: emailNorm }, orderBy: { id: 'asc' } }).catch(()=>null)
      if(hostRow) hostConnectId = hostRow.id
      if(!hostConnectId){
        const demo = DEMO_HOST_TEMPLATES.find(h => normalizeEmail(h.email) === emailNorm)
        if(demo){
          hostRow = await ensureDemoHost(demo)
          if(hostRow) hostConnectId = hostRow.id
        }
      }
    }
    if(!hostConnectId && hostName){
      hostRow = await prisma.host.findFirst({ where: { name: String(hostName) }, orderBy: { id: 'asc' } }).catch(()=>null)
      if(hostRow) hostConnectId = hostRow.id
      if(!hostConnectId){
        const demo = DEMO_HOST_TEMPLATES.find(h => h.name === String(hostName))
        if(demo){
          hostRow = await ensureDemoHost(demo)
          if(hostRow) hostConnectId = hostRow.id
        }
      }
    }
    if(!hostConnectId){
      return res.status(400).json({ error: 'host not found' })
    }

    if(email){
      await enforceReapplyCooldown({ hostId: hostConnectId, visitorEmail: email })
    }

    const appt = await prisma.appointment.create({
      data: {
        hostId: hostConnectId,
        fullName: visitorName,
        email: normalizeEmail(email || visitor?.email || ''),
        phone: phone || null,
        description: description || null,
        visitorType: visitorType || null,
        visitorId: visitor ? visitor.id : null,
        source: 'receptionist',
        status: 'pending',
        scheduledAt: null
      },
      include: { host: true }
    })

    // Notifications: visitor + receptionist + host, include appointment id in bold
    const apptIdBold = `**#${appt.id}**`
    const visitorRecipient = (email || visitor?.email) ? normalizeEmail(email || visitor?.email) : DEMO_RECIPIENT_VISITOR
    await prisma.notification.create({
      data: { recipientEmail: visitorRecipient, message: `Your appointment request ${apptIdBold} was sent successfully. Please wait for approval.` }
    }).catch((e)=>{ console.warn('notification create failed (visitor):', e?.message || e) })

    await prisma.notification.create({
      data: { recipientEmail: DEMO_RECIPIENT_RECEPTIONIST, message: `Receptionist submitted appointment request ${apptIdBold} for ${visitorName}.` }
    }).catch((e)=>{ console.warn('notification create failed (receptionist):', e?.message || e) })

    const hostEmailFinal = appt.host?.email || hostRow?.email
    if(hostEmailFinal){
      await prisma.notification.create({
        data: { recipientEmail: normalizeEmail(hostEmailFinal), message: `New appointment request ${apptIdBold} from ${visitorName} (via receptionist).` }
      }).catch((e)=>{ console.warn('notification create failed (host):', e?.message || e) })
    }

    res.json({ success: true, appointment: appt })
  }catch(err){
    console.error(err)
    const code = err?.statusCode || 500
    res.status(code).json({ error: err?.message || 'failed to create receptionist appointment' })
  }
})

app.get('/api/receptionist/notifications', async (req, res) => {
  try{
    const notes = await prisma.notification.findMany({
      where: { recipientEmail: DEMO_RECIPIENT_RECEPTIONIST },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(notes.map(n => ({ id: n.id, message: n.message, time: n.createdAt })))
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch receptionist notifications' })
  }
})

// Host -> receptionist (secretary) message
app.post('/api/host/secratery', async (req, res) => {
  const { hostId, email, message } = req.body || {}
  const text = String(message || '').trim()
  if(!text) return res.status(400).json({ error: 'message required' })
  try{
    const { host } = await resolveHostGroup({ hostId, email })
    if(!host) return res.status(401).json({ error: 'Unauthorized' })

    const formatted = `${host.name} has ordered you to "${text}"`
    const note = await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_RECEPTIONIST, message: formatted } })
    res.json({ success: true, notification: { id: note.id, message: note.message, time: note.createdAt } })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to send secratery message' })
  }
})

// Return departments and hosts
app.get('/api/visitor/home', async (req, res) => {
  try{
    const departments = await prisma.department.findMany({ include: { hosts: { select: { id: true, name: true, email: true } } } })
    // If DB empty, return default list
    if(!departments || departments.length === 0){
      const defaultDeps = [
        { name: 'Human resource' },
        { name: 'IT' },
        { name: 'Customer service' },
        { name: 'Logistics' },
        { name: 'Administrative office' }
      ]
      return res.json(defaultDeps.map(d=>({ ...d, hosts: [
        { id: 'h1', name: 'Dawit Habtamu', email: 'liranso392@gmail.com' },
        { id: 'h2', name: 'Honelign Yohannes', email: 'honelignyohannes1@gmail.com' },
        { id: 'h3', name: 'Pauwlos Betsegaw', email: 'liranso111@gmail.com' }
      ] })))
    }
    res.json(departments)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch departments' })
  }
})

// API: return departments (JSON) - alias
app.get('/api/departments', async (req, res) => {
  try{
    const departments = await prisma.department.findMany({ include: { hosts: { select: { id: true, name: true, email: true } } } })
    res.json(departments)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch departments' })
  }
})

// Visitor login: save username (no email required)
app.post('/api/visitor/login', async (req, res) => {
  const { username, email, phone } = req.body
  if(!username && !email){
    return res.status(400).json({ error: 'username or email required' })
  }
  try{
    let visitor
    if(email){
      visitor = await prisma.visitor.findUnique({ where: { email } })
    }
    if(!visitor){
      visitor = await prisma.visitor.create({ data: { username: username || null, email: email || null, phone: phone || null } })
    } else if(username && !visitor.username){
      visitor = await prisma.visitor.update({ where: { id: visitor.id }, data: { username } })
    }
    res.json(visitor)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to save visitor' })
  }
})

// Create appointment (used by frontend)
app.post('/appointments', async (req, res) => {
  const { fullName, email, phone, description, visitorType, hostId, hostName, hostEmail } = req.body
  if(!fullName || !email || !hostId){
    return res.status(400).json({ error: 'fullName, email and hostId required' })
  }
  try{
    await ensureDemoSeeded()

    // find or create visitor
    let visitor = null
    if(email){
      const emailNorm = normalizeEmail(email)
      visitor = await prisma.visitor.findUnique({ where: { email: emailNorm } })
      if(!visitor){
        visitor = await prisma.visitor.create({ data: { username: fullName, email: emailNorm, phone: phone || null } })
      }
    }

    // ensure host exists
    const hostIdNum = Number(hostId)
    const host = (!Number.isNaN(hostIdNum)) ? await prisma.host.findUnique({ where: { id: hostIdNum } }) : null

    // If host not found by id, attempt to find by email/name (and auto-create demo host if needed)
    let hostConnectId = null
    if(host){
      hostConnectId = host.id
    } else {
      const emailNorm = normalizeEmail(hostEmail)
      if(emailNorm){
        const maybeByEmail = await prisma.host.findFirst({ where: { email: emailNorm }, orderBy: { id: 'asc' } }).catch(()=>null)
        if(maybeByEmail) hostConnectId = maybeByEmail.id
        if(!hostConnectId){
          const demo = DEMO_HOST_TEMPLATES.find(h => normalizeEmail(h.email) === emailNorm)
          if(demo){
            const ensured = await ensureDemoHost(demo)
            if(ensured) hostConnectId = ensured.id
          }
        }
      }
      if(!hostConnectId && hostName){
        const maybe = await prisma.host.findFirst({ where: { name: String(hostName) }, orderBy: { id: 'asc' } }).catch(()=>null)
        if(maybe) hostConnectId = maybe.id
        if(!hostConnectId){
          const demo = DEMO_HOST_TEMPLATES.find(h => h.name === String(hostName))
          if(demo){
            const ensured = await ensureDemoHost(demo)
            if(ensured) hostConnectId = ensured.id
          }
        }
      }
    }

    if(!hostConnectId){
      return res.status(400).json({ error: 'host not found (invalid hostId/hostName)' })
    }

    await enforceReapplyCooldown({ hostId: hostConnectId, visitorEmail: email })

    // create request as PENDING (unscheduled) — will not appear in Next appointments until approved
    const appt = await prisma.appointment.create({
      data: {
        fullName,
        email: normalizeEmail(email),
        phone: phone || null,
        description: description || null,
        visitorType: visitorType || null,
        hostId: hostConnectId,
        visitorId: visitor ? visitor.id : null,
        source: 'visitor',
        status: 'pending',
        scheduledAt: null
      }
    }).catch(e=>{ throw e })

    // Notifications: visitor + host, include appointment id in bold (frontend renders **...** as bold)
    const apptIdBold = `**#${appt.id}**`
    const visitorRecipient = email ? normalizeEmail(email) : DEMO_RECIPIENT_VISITOR
    await prisma.notification.create({
      data: {
        recipientEmail: visitorRecipient,
        message: `Your appointment request ${apptIdBold} was sent successfully. Please wait for approval.`
      }
    }).catch((e)=>{ console.warn('notification create failed (visitor):', e?.message || e) })

    // Notify host (by email) when possible
    const hostRow = host || await prisma.host.findUnique({ where: { id: hostConnectId } }).catch(()=>null)
    if(hostRow?.email){
      await prisma.notification.create({
        data: {
          recipientEmail: normalizeEmail(hostRow.email),
          message: `New appointment request ${apptIdBold} from ${fullName}.` 
        }
      }).catch((e)=>{ console.warn('notification create failed (host):', e?.message || e) })
    }

    res.json({ success: true, appointment: appt })
  }catch(err){
    console.error(err)
    const code = err?.statusCode || 500
    res.status(code).json({ error: err?.message || 'failed to create appointment' })
  }
})

// Kiosk: create appointment (pending)
app.post('/appointments/kiosk', async (req, res) => {
  const { fullName, email, phone, description, visitorType, hostId, hostEmail, hostName } = req.body || {}
  if(!fullName || (!hostId && !hostEmail && !hostName)){
    return res.status(400).json({ error: 'fullName and hostId/hostEmail/hostName required' })
  }
  try{
    await ensureDemoSeeded()

    let visitor = null
    if(email){
      const emailNorm = normalizeEmail(email)
      visitor = await prisma.visitor.findUnique({ where: { email: emailNorm } })
      if(!visitor){
        visitor = await prisma.visitor.create({ data: { username: fullName, email: emailNorm, phone: phone || null } })
      }
    }

    // Resolve host id from any of: numeric hostId, hostEmail, hostName
    let hostConnectId = null
    let hostRow = null

    if(hostId && !Number.isNaN(Number(hostId))){
      hostRow = await prisma.host.findUnique({ where: { id: Number(hostId) } }).catch(()=>null)
      if(hostRow) hostConnectId = hostRow.id
    }
    if(!hostConnectId && hostEmail){
      const emailNorm = normalizeEmail(hostEmail)
      hostRow = await prisma.host.findFirst({ where: { email: emailNorm }, orderBy: { id: 'asc' } }).catch(()=>null)
      if(hostRow) hostConnectId = hostRow.id
      if(!hostConnectId){
        const demo = DEMO_HOST_TEMPLATES.find(h => normalizeEmail(h.email) === emailNorm)
        if(demo){
          hostRow = await ensureDemoHost(demo)
          if(hostRow) hostConnectId = hostRow.id
        }
      }
    }
    if(!hostConnectId && hostName){
      hostRow = await prisma.host.findFirst({ where: { name: String(hostName) } }).catch(()=>null)
      if(hostRow) hostConnectId = hostRow.id
      if(!hostConnectId){
        const demo = DEMO_HOST_TEMPLATES.find(h => h.name === String(hostName))
        if(demo){
          hostRow = await ensureDemoHost(demo)
          if(hostRow) hostConnectId = hostRow.id
        }
      }
    }
    if(!hostConnectId){
      return res.status(400).json({ error: 'host not found' })
    }

    if(email){
      await enforceReapplyCooldown({ hostId: hostConnectId, visitorEmail: email })
    }

    const appt = await prisma.appointment.create({
      data: {
        hostId: hostConnectId,
        fullName,
        email: normalizeEmail(email || visitor?.email || ''),
        phone: phone || null,
        description: description || null,
        visitorType: visitorType || null,
        visitorId: visitor ? visitor.id : null,
        source: 'kiosk',
        status: 'pending',
        scheduledAt: null
      }
    })

    // Notifications: visitor + host, include appointment id in bold
    const apptIdBold = `**#${appt.id}**`
    const visitorRecipient = (email || visitor?.email) ? normalizeEmail(email || visitor?.email) : DEMO_RECIPIENT_VISITOR
    await prisma.notification.create({
      data: {
        recipientEmail: visitorRecipient,
        message: `Your appointment request ${apptIdBold} was sent successfully. Please wait for approval.`
      }
    }).catch((e)=>{ console.warn('notification create failed (visitor):', e?.message || e) })
    if(hostRow?.email){
      await prisma.notification.create({
        data: {
          recipientEmail: normalizeEmail(hostRow.email),
          message: `New appointment request ${apptIdBold} from ${fullName}.` 
        }
      }).catch((e)=>{ console.warn('notification create failed (host):', e?.message || e) })
    }

    res.json({ success: true, appointment: appt })
  }catch(err){
    console.error(err)
    const code = err?.statusCode || 500
    res.status(code).json({ error: err?.message || 'failed to create kiosk appointment' })
  }
})

// Kiosk: lookup appointment by publicId or email
app.get('/api/kiosk/appointment', async (req, res) => {
  const term = String(req.query.term || '').trim()
  if(!term) return res.status(400).json({ error: 'term required' })
  try{
    const appt = await prisma.appointment.findFirst({ where: { OR: [ { publicId: term }, { email: term } ] }, include: { host: true } })
    if(!appt) return res.status(404).json({ error: 'appointment not found' })
    res.json({ id: appt.id, publicId: appt.publicId, fullName: appt.fullName, host: appt.host?.name || '', scheduledAt: appt.scheduledAt, status: appt.status, description: appt.description })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to lookup appointment' }) }
})

// Kiosk: checkin by publicId or email
app.post('/api/kiosk/checkin', async (req, res) => {
  const { term } = req.body || {}
  if(!term) return res.status(400).json({ error: 'term required' })
  try{
    const appt = await prisma.appointment.findFirst({ where: { OR: [ { publicId: term }, { email: term } ] }, include: { host: true } })
    if(!appt) return res.status(404).json({ error: 'appointment not found' })
    const updated = await prisma.appointment.update({ where: { id: appt.id }, data: { status: 'checked-in' } })
    // notify receptionist demo bucket
    await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_RECEPTIONIST, message: `${updated.fullName} ( ${updated.publicId || ''} ) checked in via kiosk` } }).catch(()=>null)
    res.json({ success: true, appointment: updated })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to check in' }) }
})

// Kiosk: checkout by publicId or email
app.post('/api/kiosk/checkout', async (req, res) => {
  const { term } = req.body || {}
  if(!term) return res.status(400).json({ error: 'term required' })
  try{
    const appt = await prisma.appointment.findFirst({ where: { OR: [ { publicId: term }, { email: term } ] }, include: { host: true } })
    if(!appt) return res.status(404).json({ error: 'appointment not found' })
    const updated = await prisma.appointment.update({ where: { id: appt.id }, data: { status: 'checked-out' } })
    await prisma.notification.create({ data: { recipientEmail: DEMO_RECIPIENT_RECEPTIONIST, message: `${updated.fullName} ( ${updated.publicId || ''} ) checked out via kiosk` } }).catch(()=>null)
    res.json({ success: true, appointment: updated })
  }catch(err){ console.error(err); res.status(500).json({ error: 'failed to check out' }) }
})

// Visitor history (optional query by email or username)
app.get('/api/visitor/history', async (req, res) => {
  const { email, username } = req.query
  try{
    let where = {}
    if(email) where.email = email
    if(username) where.username = username

    if(email || username){
      const visitor = await prisma.visitor.findFirst({ where })
      if(!visitor) return res.json([])
      const appts = await prisma.appointment.findMany({ where: { visitorId: visitor.id }, include: { host: true } })
      return res.json(appts)
    }

    // otherwise return recent appointments
    const appts = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { host: true } })
    res.json(appts)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch history' })
  }
})

// Visitor notifications (simple recent appointments)
app.get('/api/visitor/notifications', async (req, res) => {
  try{
    const { email } = req.query
    const recipients = []
    if(email){
      const raw = String(email)
      const norm = normalizeEmail(raw)
      recipients.push(raw)
      if(norm && norm !== raw) recipients.push(norm)
    }
    // demo visitor endpoint notifications (no user-specific recipient)
    recipients.push(DEMO_RECIPIENT_VISITOR)

    const notes = await prisma.notification.findMany({
      where: { recipientEmail: { in: recipients } },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    const mapped = notes.map(n => ({ id: n.id, message: n.message, time: n.createdAt }))
    res.json(mapped)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch notifications' })
  }
})

// Visitor delete a notification
app.delete('/api/visitor/notifications/:id', async (req, res) => {
  try{
    const { email } = req.query
    const id = Number(req.params.id)
    if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid notification id' })

    const note = await prisma.notification.findUnique({ where: { id } })
    if(!note) return res.status(404).json({ error: 'notification not found' })

    // demo mode: allow deleting demo visitor notifications without email
    if(email){
      const allowed = note.recipientEmail === String(email) || note.recipientEmail === DEMO_RECIPIENT_VISITOR
      if(!allowed) return res.status(403).json({ error: 'Not allowed' })
    }else{
      if(note.recipientEmail !== DEMO_RECIPIENT_VISITOR) return res.status(403).json({ error: 'Not allowed' })
    }

    await prisma.notification.delete({ where: { id } })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to delete notification' })
  }
})

// ---------------- Admin API ----------------

// Admin analytics (numbers only)
app.get('/api/admin/analytics', async (req, res) => {
  try{
    await ensureDemoSeeded()

    const now = new Date()
    const from = startOfWeek(now)
    const to = endOfWeek(now)

    const weekAppointments = await prisma.appointment.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: { id: true, source: true, email: true, scheduledAt: true }
    })

    const appointmentsThisWeek = weekAppointments.length
    const hoursThisWeek = weekAppointments.filter(a => a.scheduledAt).length
    const receptionistRequestsThisWeek = weekAppointments.filter(a => a.source === 'receptionist').length

    const kioskVisitorEmails = new Set(
      weekAppointments
        .filter(a => a.source === 'kiosk')
        .map(a => normalizeEmail(a.email))
        .filter(Boolean)
    )
    const onlineVisitorEmails = new Set(
      weekAppointments
        .filter(a => a.source === 'visitor')
        .map(a => normalizeEmail(a.email))
        .filter(Boolean)
    )

    const departmentsCount = await prisma.department.count().catch(()=>0)

    // host grouping by email (seed may create duplicates)
    const hostRows = await prisma.host.findMany({ select: { email: true } }).catch(()=>[])
    const hostEmails = new Set((hostRows||[]).map(h => normalizeEmail(h.email)).filter(Boolean))
    const hostsCount = hostEmails.size

    const appointmentsTotal = await prisma.appointment.count().catch(()=>0)

    res.json({
      week: {
        from: from.toISOString(),
        to: to.toISOString(),
        appointments: appointmentsThisWeek,
        appointmentHours: hoursThisWeek,
        visitorsKiosk: kioskVisitorEmails.size,
        visitorsOnline: onlineVisitorEmails.size,
        receptionistRequests: receptionistRequestsThisWeek
      },
      system: {
        departments: departmentsCount,
        hosts: hostsCount,
        appointmentsTotal
      }
    })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch analytics' })
  }
})

// Admin hosts (grouped by email)
app.get('/api/admin/hosts', async (req, res) => {
  try{
    await ensureDemoSeeded()
    const rows = await prisma.host.findMany({ include: { department: true }, orderBy: { id: 'asc' } })
    const byEmail = new Map()
    for(const h of rows){
      const emailNorm = normalizeEmail(h.email)
      if(!emailNorm) continue
      if(!byEmail.has(emailNorm)){
        byEmail.set(emailNorm, {
          id: h.id,
          name: h.name,
          email: emailNorm,
          departmentId: h.departmentId || null,
          department: h.department?.name || ''
        })
      }
    }
    res.json(Array.from(byEmail.values()))
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch hosts' })
  }
})

app.post('/api/admin/hosts', async (req, res) => {
  try{
    await ensureDemoSeeded()
    const { name, email, departmentId, department } = req.body || {}
    const hostName = String(name || '').trim()
    const emailNorm = normalizeEmail(email)
    if(!hostName || !emailNorm) return res.status(400).json({ error: 'name and email required' })

    let deptId = null
    if(departmentId && !Number.isNaN(Number(departmentId))) deptId = Number(departmentId)
    if(!deptId && department){
      const deptName = String(department).trim()
      if(deptName){
        const dept = await prisma.department.findUnique({ where: { name: deptName } }).catch(()=>null)
        deptId = dept?.id || (await prisma.department.create({ data: { name: deptName } }).catch(()=>null))?.id || null
      }
    }

    const existing = await prisma.host.findFirst({ where: { email: emailNorm }, orderBy: { id: 'asc' } }).catch(()=>null)
    if(existing) return res.status(409).json({ error: 'host already exists with this email' })

    const created = await prisma.host.create({ data: { name: hostName, email: emailNorm, departmentId: deptId } })
    res.json({ success: true, host: created })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to create host' })
  }
})

app.put('/api/admin/hosts/:id', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' })
  try{
    const { name, email, departmentId, department } = req.body || {}
    const base = await prisma.host.findUnique({ where: { id } }).catch(()=>null)
    if(!base) return res.status(404).json({ error: 'host not found' })

    const nextName = (name !== undefined) ? String(name || '').trim() : undefined
    const nextEmail = (email !== undefined) ? normalizeEmail(email || '') : undefined

    let deptId = undefined
    if(departmentId !== undefined){
      deptId = (departmentId && !Number.isNaN(Number(departmentId))) ? Number(departmentId) : null
    }
    if(deptId === undefined && department !== undefined){
      const deptName = String(department || '').trim()
      if(!deptName) deptId = null
      else {
        const dept = await prisma.department.findUnique({ where: { name: deptName } }).catch(()=>null)
        deptId = dept?.id || (await prisma.department.create({ data: { name: deptName } }).catch(()=>null))?.id || null
      }
    }

    const groupEmail = normalizeEmail(base.email)
    await prisma.host.updateMany({
      where: { email: groupEmail },
      data: {
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(nextEmail !== undefined ? { email: nextEmail } : {}),
        ...(deptId !== undefined ? { departmentId: deptId } : {})
      }
    })

    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to update host' })
  }
})

app.delete('/api/admin/hosts/:id', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' })
  try{
    const base = await prisma.host.findUnique({ where: { id } }).catch(()=>null)
    if(!base) return res.status(404).json({ error: 'host not found' })
    const groupEmail = normalizeEmail(base.email)
    await prisma.host.deleteMany({ where: { email: groupEmail } })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to delete host' })
  }
})

// Admin receptionists
app.get('/api/admin/receptionists', async (req, res) => {
  try{
    await ensureDemoSeeded()
    const rows = await prisma.receptionist.findMany({ include: { department: true }, orderBy: { id: 'asc' } })
    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      departmentId: r.departmentId || null,
      department: r.department?.name || ''
    }))
    res.json(mapped)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to fetch receptionists' })
  }
})

app.post('/api/admin/receptionists', async (req, res) => {
  try{
    await ensureDemoSeeded()
    const { name, email, departmentId, department } = req.body || {}
    const recName = String(name || '').trim()
    const emailNorm = normalizeEmail(email)
    if(!recName || !emailNorm) return res.status(400).json({ error: 'name and email required' })

    let deptId = null
    if(departmentId && !Number.isNaN(Number(departmentId))) deptId = Number(departmentId)
    if(!deptId && department){
      const deptName = String(department).trim()
      if(deptName){
        const dept = await prisma.department.findUnique({ where: { name: deptName } }).catch(()=>null)
        deptId = dept?.id || (await prisma.department.create({ data: { name: deptName } }).catch(()=>null))?.id || null
      }
    }

    const created = await prisma.receptionist.create({ data: { name: recName, email: emailNorm, departmentId: deptId } })
    res.json({ success: true, receptionist: created })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to create receptionist' })
  }
})

app.put('/api/admin/receptionists/:id', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' })
  try{
    const { name, email, departmentId, department } = req.body || {}

    let deptId = undefined
    if(departmentId !== undefined){
      deptId = (departmentId && !Number.isNaN(Number(departmentId))) ? Number(departmentId) : null
    }
    if(deptId === undefined && department !== undefined){
      const deptName = String(department || '').trim()
      if(!deptName) deptId = null
      else {
        const dept = await prisma.department.findUnique({ where: { name: deptName } }).catch(()=>null)
        deptId = dept?.id || (await prisma.department.create({ data: { name: deptName } }).catch(()=>null))?.id || null
      }
    }

    await prisma.receptionist.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name || '').trim() } : {}),
        ...(email !== undefined ? { email: normalizeEmail(email || '') } : {}),
        ...(deptId !== undefined ? { departmentId: deptId } : {})
      }
    })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to update receptionist' })
  }
})

app.delete('/api/admin/receptionists/:id', async (req, res) => {
  const id = Number(req.params.id)
  if(!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' })
  try{
    await prisma.receptionist.delete({ where: { id } })
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'failed to delete receptionist' })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on ${PORT}`)
})
