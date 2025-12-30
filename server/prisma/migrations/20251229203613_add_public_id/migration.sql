-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" INTEGER,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostBlock" (
    "id" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "description" TEXT,
    "visitorType" TEXT,
    "hostId" INTEGER NOT NULL,
    "visitorId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3),
    "rescheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_email_key" ON "Visitor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HostBlock_hostId_startAt_key" ON "HostBlock"("hostId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_publicId_key" ON "Appointment"("publicId");

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostBlock" ADD CONSTRAINT "HostBlock_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
