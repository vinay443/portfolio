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
  // A section whose list has been filtered down to its empty state drops the full
  // section rhythm, so a search that empties it does not leave a tall blank band.
  return (
    <section
      id={id}
      className="border-rule max-w-column py-section scroll-mt-14 border-t has-[[data-empty-state]]:pt-8 has-[[data-empty-state]]:pb-0"
    >
      <h2 className="text-step-3 font-medium tracking-[-0.02em]">{title}</h2>
      <div className="mt-10 grid gap-10 has-[[data-empty-state]]:mt-0">{children}</div>
    </section>
  );
}
