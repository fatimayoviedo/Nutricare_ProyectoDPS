import { Construction } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "./PageHeader";

export function FeaturePlaceholder({ title, description, nextStep }: { title: string; description: string; nextStep: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="grid min-h-72 place-items-center text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Construction /></span>
          <h2 className="mt-5 text-xl font-bold">Base preparada</h2>
          <p className="mt-2 leading-7 text-[var(--ink-muted)]">{nextStep}</p>
        </div>
      </Card>
    </>
  );
}

