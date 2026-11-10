import { Suspense } from "react";
import { io } from "next/cache";
import { DebtChart } from "@/components/debt-chart";
import { JourneyCoach } from "@/components/journey/journey-coach";
import { MonthAgenda } from "@/components/month-agenda";
import { MonthSnapshot } from "@/components/month-snapshot";
import { PageFrame } from "@/components/page-frame";
import { PageHeader } from "@/components/page-header";
import { ThisMonthDue } from "@/components/this-month-due";
import { Card, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { formatCurrency, formatDate, getDebtFreedomDate, getDebtInsights, getMonthlyPaymentSeries, getMonthlyRepayment, getMonthsToDebtFreedom, getOverallDebtProgress, getTotalDebt, } from "@/lib/debts";
import { getDsrSummary, getMonthlyIncome } from "@/lib/income";
import { getTotalInvestments } from "@/lib/investments";
import { prisma } from "@/lib/prisma";

function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardDescription>This month&apos;s debt payment</CardDescription>
          <CardTitle className="font-mono text-4xl tracking-tight">
            {formatCurrency(0)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

function currentMonthLabel(asOf = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(asOf);
}

async function DashboardContent() {
  await io();

  const asOf = new Date();
  const [debts, incomes, investments] = await Promise.all([
    prisma.debt.findMany({
      orderBy: [{ category: "asc" }, { startDate: "asc" }],
    }),
    prisma.income.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
    prisma.investment.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const monthlyRepayment = getMonthlyRepayment(debts, asOf);
  const monthlyIncome = getMonthlyIncome(incomes, asOf);
  const dsr = getDsrSummary(monthlyIncome, monthlyRepayment);
  const insights = getDebtInsights(debts, asOf);
  const remainingDebt = getTotalDebt(debts, asOf);
  const totalInvestments = getTotalInvestments(investments);
  const chartData = getMonthlyPaymentSeries(debts, asOf, 6);
  const progress = getOverallDebtProgress(debts, asOf);
  const freedomDate = getDebtFreedomDate(debts, asOf);
  const monthsToFreedom = getMonthsToDebtFreedom(debts, asOf);
  const dueCount = insights.filter((item) => item.dueThisMonth > 0).length;

  return (
    <>
      <JourneyCoach
        context={{
          remainingDebt,
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
      />

      <MonthSnapshot
        income={monthlyIncome}
        debtPayment={monthlyRepayment}
        capability={dsr.capabilityToPay}
        dsr={dsr}
        remainingDebt={remainingDebt}
        totalInvestments={totalInvestments}
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <MonthAgenda insights={insights} />
        <DebtChart data={chartData} />
      </div>
    </>
  );
}

export default function Home() {
  const monthLabel = currentMonthLabel();

  return (
    <PageFrame>
      <PageHeader
        page="dashboard"
        title="Dashboard"
        description={`What is happening in ${monthLabel}: money in, debt out, and what still needs attention.`}
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageFrame>
  );
}
