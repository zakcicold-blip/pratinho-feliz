"use client";

import { useFormStatus } from "react-dom";
import { gerarProximoCiclo } from "@/lib/actions/plan";
import Button from "@/components/ui/Button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? "Gerando..." : label}
    </Button>
  );
}

export default function GerarProximoCicloButton({
  childId,
  label,
}: {
  childId: string;
  label: string;
}) {
  return (
    <form action={gerarProximoCiclo.bind(null, childId)}>
      <SubmitButton label={label} />
    </form>
  );
}
