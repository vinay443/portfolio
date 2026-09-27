import type { Metadata } from "next";
import Link from "next/link";

// Next reads a not-found file's `metadata` when it renders a 404, after the
// layouts', so this title still runs through the root layout's template.
export const metadata: Metadata = {
  title: "Page not found",
};

/** Every URL that matches no route lands here, inside the root layout. */
export default function NotFound() {
  return (
    <main id="content" tabIndex={-1} className="flex-1 px-6 outline-none md:px-12 lg:px-20">
      <div className="max-w-column py-section mx-auto">
        <h1 className="text-step-3 font-medium tracking-[-0.02em]">Page not found</h1>
        <p className="text-step-0 text-ink-2 max-w-measure mt-4">
          That page does not exist, or it has moved.
        </p>
        <p className="mt-8">
          <Link href="/" className="text-step-0 text-accent underline underline-offset-4">
            Back to the index
          </Link>
        </p>
      </div>
    </main>
  );
}
