-- CreateTable
CREATE TABLE "GuestLoginCode" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestLoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestLoginCode_guestId_idx" ON "GuestLoginCode"("guestId");

-- AddForeignKey
ALTER TABLE "GuestLoginCode" ADD CONSTRAINT "GuestLoginCode_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
