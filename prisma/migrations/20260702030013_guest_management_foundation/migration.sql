/*
  Warnings:

  - You are about to drop the column `arrival` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `departure` on the `Visit` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Guest` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Guest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `color` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalDateTime` to the `Visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Guest" ("createdAt", "email", "firstName", "id", "lastName", "phone") SELECT "createdAt", "email", "firstName", "id", "lastName", "phone" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
CREATE UNIQUE INDEX "Guest_email_key" ON "Guest"("email");
CREATE UNIQUE INDEX "Guest_phone_key" ON "Guest"("phone");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Vehicle_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("guestId", "id", "make", "model", "plate", "state", "year") SELECT "guestId", "id", "make", "model", "plate", "state", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE INDEX "Vehicle_guestId_idx" ON "Vehicle"("guestId");
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "arrivalDateTime" DATETIME NOT NULL,
    "departureDateTime" DATETIME,
    "parkingRequired" BOOLEAN NOT NULL DEFAULT true,
    "buildingAccessRequired" BOOLEAN NOT NULL DEFAULT true,
    "apartmentAccessRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visit_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("buildingAccessRequired", "createdAt", "guestId", "id", "parkingRequired", "status") SELECT "buildingAccessRequired", "createdAt", "guestId", "id", "parkingRequired", "status" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE INDEX "Visit_guestId_idx" ON "Visit"("guestId");
CREATE INDEX "Visit_status_idx" ON "Visit"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
