-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Debt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "loanAmount" REAL NOT NULL,
    "monthlyPayment" REAL NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Debt" ("createdAt", "endDate", "fee", "id", "loanAmount", "monthlyPayment", "name", "startDate", "updatedAt") SELECT "createdAt", "endDate", "fee", "id", "loanAmount", "monthlyPayment", "name", "startDate", "updatedAt" FROM "Debt";
DROP TABLE "Debt";
ALTER TABLE "new_Debt" RENAME TO "Debt";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
