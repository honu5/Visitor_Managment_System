const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
dotenv.config()

const prisma = new PrismaClient()

async function main(){
  const departments = [
    'Human resource',
    'IT',
    'Customer service',
    'Logistics',
    'Administrative office'
  ]

  const hostTemplates = [
    { name: 'Dawit Habtamu', email: 'liranso392@gmail.com' },
    { name: 'Honelign Yohannes', email: 'honelignyohannes1@gmail.com' },
    { name: 'Pauwlos Betsegaw', email: 'liranso111@gmail.com' }
  ]

  for(const deptName of departments){
    let dept = await prisma.department.findUnique({ where: { name: deptName } })
    if(!dept){
      dept = await prisma.department.create({ data: { name: deptName } })
    }

    for(const h of hostTemplates){
      const exists = await prisma.host.findFirst({ where: { name: h.name, email: h.email, departmentId: dept.id } })
      if(!exists){
        await prisma.host.create({ data: { name: h.name, email: h.email, departmentId: dept.id } })
      }
    }
  }

  console.log('Seed completed')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
