-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "building" TEXT,
ADD COLUMN     "officeNumber" TEXT;

-- CreateTable
CREATE TABLE "HostVisitorCooldown" (
    "id" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "visitorEmail" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostVisitorCooldown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HostVisitorCooldown_visitorEmail_idx" ON "HostVisitorCooldown"("visitorEmail");

-- CreateIndex
CREATE UNIQUE INDEX "HostVisitorCooldown_hostId_visitorEmail_key" ON "HostVisitorCooldown"("hostId", "visitorEmail");

-- AddForeignKey
ALTER TABLE "HostVisitorCooldown" ADD CONSTRAINT "HostVisitorCooldown_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
