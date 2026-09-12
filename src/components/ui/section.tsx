import type { ReactNode } from "react";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-rule py-section scroll-mt-14 border-t">
      <h2 className="text-step-3 font-medium tracking-[-0.02em]">{title}</h2>
      <div className="mt-10 grid gap-10">{children}</div>
    </section>
  );
}
