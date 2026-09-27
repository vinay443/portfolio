import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Project not found",
};

export default function ProjectNotFound() {
  return (
    <main id="content" tabIndex={-1} className="flex-1 px-6 outline-none md:px-12 lg:px-20">
      <div className="max-w-column py-section mx-auto">
        <h1 className="text-step-3 font-medium tracking-[-0.02em]">No such project</h1>
        <p className="text-step-0 text-ink-2 max-w-measure mt-4">
          That project does not exist, or it is client work that is not published here.
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
