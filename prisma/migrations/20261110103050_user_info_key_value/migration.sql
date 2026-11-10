/*
  Warnings:

  - The primary key for the `UserInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateOfBirth` on the `UserInfo` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `UserInfo` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `UserInfo` table. All the data in the column will be lost.
  - Added the required column `key` to the `UserInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `UserInfo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserInfo" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "UserInfo";
DROP TABLE "UserInfo";
ALTER TABLE "new_UserInfo" RENAME TO "UserInfo";
CREATE UNIQUE INDEX "UserInfo_key_key" ON "UserInfo"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
