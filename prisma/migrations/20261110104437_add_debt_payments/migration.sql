-- CreateTable
CREATE TABLE "DebtPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "debtId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "paidAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "expectedAmount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DebtPayment_debtId_idx" ON "DebtPayment"("debtId");

-- CreateIndex
CREATE INDEX "DebtPayment_paidAt_idx" ON "DebtPayment"("paidAt");

-- CreateIndex
CREATE INDEX "DebtPayment_periodYear_periodMonth_idx" ON "DebtPayment"("periodYear", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "DebtPayment_debtId_periodYear_periodMonth_key" ON "DebtPayment"("debtId", "periodYear", "periodMonth");
