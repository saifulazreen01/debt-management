import { Suspense } from "react";
import { io } from "next/cache";
import { InvestmentFormDialog } from "@/components/form/investment-form-dialog";
import { InvestmentList } from "@/components/investment-list";
import { InvestmentReport } from "@/components/investment-report";
import { PageFrame } from "@/components/page-frame";
import { PageHeader } from "@/components/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/debts";
import { getMonthlyIncome } from "@/lib/income";
import {
  getInvestmentCategoryReport,
  getTotalInvestments,
  getTotalMonthlyInvestmentContribution,
} from "@/lib/investments";
import { prisma } from "@/lib/prisma";

async function InvestmentsContent() {
  await io();

  const [investments, incomes] = await Promise.all([
    prisma.investment.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
    prisma.income.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const monthlyIncome = getMonthlyIncome(incomes);
  const totalInvestments = getTotalInvestments(investments);
  const monthlyContribution = getTotalMonthlyInvestmentContribution(
    investments,
    monthlyIncome
  );
  const investmentReport = getInvestmentCategoryReport(
    investments,
    monthlyIncome
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total investments</CardDescription>
            <CardTitle className="font-mono text-3xl tracking-tight">
              {formatCurrency(totalInvestments)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Monthly contribution</CardDescription>
            <CardTitle className="font-mono text-3xl tracking-tight">
              {formatCurrency(monthlyContribution)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Investment entries</CardDescription>
            <CardTitle className="text-3xl tracking-tight">
              {investments.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <InvestmentReport rows={investmentReport} />
      <InvestmentList
        investments={investments}
        monthlyIncome={monthlyIncome}
      />
    </>
  );
}

export default function InvestmentsPage() {
  return (
    <PageFrame>
      <PageHeader
        page="investments"
        title="Investments"
        description="Track balances and monthly top-ups as a fixed amount or percent of income."
        actions={<InvestmentFormDialog />}
      />
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardDescription>Total investments</CardDescription>
              <CardTitle className="font-mono text-3xl tracking-tight">
                {formatCurrency(0)}
              </CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <InvestmentsContent />
      </Suspense>
    </PageFrame>
  );
}
