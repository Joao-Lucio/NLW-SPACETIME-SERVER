-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Memory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coverUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Memory" ("content", "coverUrl", "createAt", "id", "isPublic", "userId") SELECT "content", "coverUrl", "createAt", "id", "isPublic", "userId" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
