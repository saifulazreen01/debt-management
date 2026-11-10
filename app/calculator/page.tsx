import { FinancialCalculator } from "@/components/calculator/financial-calculator";
import { PageFrame } from "@/components/page-frame";
import { PageHeader } from "@/components/page-header";

export default function CalculatorPage() {
  return (
    <PageFrame>
      <PageHeader
        page="calculator"
        title="Calculator"
        description="Compare investment paths or loan offers side by side before you commit."
      />
      <FinancialCalculator />
    </PageFrame>
  );
}
