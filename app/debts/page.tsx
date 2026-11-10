import { Suspense } from "react";
import { io } from "next/cache";
import { CategoryReport } from "@/components/category-report";
import { DebtFreedomPanel } from "@/components/debt-freedom-panel";
import { DebtList } from "@/components/debt-list";
import { DebtPayoffCards } from "@/components/debt-payoff-cards";
import { DebtFormDialog } from "@/components/form/debt-form-dialog";
import { JourneyCoach } from "@/components/journey/journey-coach";
import { PageFrame } from "@/components/page-frame";
import { PageHeader } from "@/components/page-header";
import { PaymentLog } from "@/components/payment-log";
import { ThisMonthDue } from "@/components/this-month-due";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  getCategoryReport,
  getDebtFreedomDate,
  getDebtInsights,
  getMonthlyRepayment,
  getMonthsToDebtFreedom,
  getOverallDebtProgress,
  getTotalDebt,
  getTotalRemainingInterest,
} from "@/lib/debts";
import { getDsrSummary, getMonthlyIncome } from "@/lib/income";
import { prisma } from "@/lib/prisma";

async function DebtsContent() {
  await io();

  const [debts, incomes, payments] = await Promise.all([
    prisma.debt.findMany({
      orderBy: [{ category: "asc" }, { startDate: "asc" }],
    }),
    prisma.income.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
    prisma.debtPayment.findMany({
      include: { debt: true },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }, { paidAt: "desc" }],
    }),
  ]);

  const totalDebt = getTotalDebt(debts);
  const remainingInterest = getTotalRemainingInterest(debts);
  const monthlyRepayment = getMonthlyRepayment(debts);
  const monthlyIncome = getMonthlyIncome(incomes);
  const dsr = getDsrSummary(monthlyIncome, monthlyRepayment);
  const freedomDate = getDebtFreedomDate(debts);
  const monthsToFreedom = getMonthsToDebtFreedom(debts);
  const progress = getOverallDebtProgress(debts);
  const insights = getDebtInsights(debts);
  const categoryReport = getCategoryReport(debts);
  const dueCount = insights.filter((item) => item.dueThisMonth > 0).length;

  return (
    <>
      <JourneyCoach
        context={{
          remainingDebt: totalDebt,
          monthlyRepayment,
          dueCount,
          progress,
          dsrLevel: dsr.level,
          monthsToFreedom,
          freedomDateLabel: freedomDate ? formatDate(freedomDate) : null,
        }}
      />

      <ThisMonthDue
        amount={monthlyRepayment}
        income={monthlyIncome}
        capability={dsr.capabilityToPay}
        upcoming={insights}
        showReviewLink={false}
      />

      <DebtFreedomPanel
        remainingDebt={totalDebt}
        remainingInterest={remainingInterest}
        freedomDate={freedomDate}
        monthsToFreedom={monthsToFreedom}
        progress={progress}
        dsr={dsr}
      />

      <DebtPayoffCards insights={insights} />
      <PaymentLog debts={debts} payments={payments} />
      <CategoryReport rows={categoryReport} />
      <DebtList debts={debts} />
    </>
  );
}

export default function DebtsPage() {
  return (
    <PageFrame>
      <PageHeader
        page="debts"
        title="Debts"
        description="Know this month's payment, settle dates, and interest left on every loan."
        actions={<DebtFormDialog />}
      />
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardDescription>This month&apos;s debt payment</CardDescription>
              <CardTitle className="text-4xl tracking-tight">
                {formatCurrency(0)}
              </CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <DebtsContent />
      </Suspense>
    </PageFrame>
  );
}
