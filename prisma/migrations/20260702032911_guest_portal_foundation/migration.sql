-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "arrivalDateTime" DATETIME NOT NULL,
    "departureDateTime" DATETIME,
    "parkingRequired" BOOLEAN NOT NULL DEFAULT true,
    "buildingAccessRequired" BOOLEAN NOT NULL DEFAULT true,
    "apartmentAccessRequired" BOOLEAN NOT NULL DEFAULT true,
    "requestNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visit_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Visit_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("apartmentAccessRequired", "arrivalDateTime", "buildingAccessRequired", "createdAt", "departureDateTime", "guestId", "id", "parkingRequired", "status", "updatedAt") SELECT "apartmentAccessRequired", "arrivalDateTime", "buildingAccessRequired", "createdAt", "departureDateTime", "guestId", "id", "parkingRequired", "status", "updatedAt" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE INDEX "Visit_guestId_idx" ON "Visit"("guestId");
CREATE INDEX "Visit_vehicleId_idx" ON "Visit"("vehicleId");
CREATE INDEX "Visit_status_idx" ON "Visit"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
