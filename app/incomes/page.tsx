import { Suspense } from "react";
import { io } from "next/cache";
import { IncomeFormDialog } from "@/components/form/income-form-dialog";
import { IncomeList } from "@/components/income-list";
import { IncomeReport } from "@/components/income-report";
import { PageFrame } from "@/components/page-frame";
import { PageHeader } from "@/components/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/debts";
import { getIncomeCategoryReport, getMonthlyIncome } from "@/lib/income";
import { prisma } from "@/lib/prisma";

async function IncomesContent() {
  await io();

  const incomes = await prisma.income.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });
  const monthlyIncome = getMonthlyIncome(incomes);
  const incomeReport = getIncomeCategoryReport(incomes);
  const needsIncomeSetup = incomes.length === 0;

  return (
    <>
      <PageHeader
        page="incomes"
        title="Incomes"
        description="Manage salary, other income, and leasing by category."
        actions={
          <IncomeFormDialog
            needsSetup={needsIncomeSetup}
            defaultOpen={needsIncomeSetup}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Active monthly income</CardDescription>
            <CardTitle className="text-3xl tracking-tight">
              {formatCurrency(monthlyIncome)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Income entries</CardDescription>
            <CardTitle className="text-3xl tracking-tight">
              {incomes.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {needsIncomeSetup ? (
        <Card>
          <CardHeader>
            <CardTitle>Key in your income</CardTitle>
            <CardDescription>
              Add salary, other income, or leasing so DSR and cashflow can
              calculate.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <IncomeReport rows={incomeReport} />
      <IncomeList incomes={incomes} />
    </>
  );
}

export default function IncomesPage() {
  return (
    <PageFrame>
      <Suspense
        fallback={
          <>
            <PageHeader
              page="incomes"
              title="Incomes"
              description="Manage salary, other income, and leasing by category."
            />
            <Card>
              <CardHeader>
                <CardDescription>Active monthly income</CardDescription>
                <CardTitle className="text-3xl tracking-tight">
                  {formatCurrency(0)}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        }
      >
        <IncomesContent />
      </Suspense>
    </PageFrame>
  );
}
