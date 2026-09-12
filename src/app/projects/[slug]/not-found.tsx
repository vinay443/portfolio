import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="px-6 py-section md:px-12 lg:px-20">
      <h1 className="text-step-3 font-medium tracking-[-0.02em]">No such project</h1>
      <p className="text-step-0 text-ink-2 mt-4 max-w-measure">
        That project does not exist, or it is client work that is not published here.
      </p>
      <p className="mt-8">
        <Link href="/" className="text-step-0 text-accent underline underline-offset-4">
          Back to the index
        </Link>
      </p>
    </div>
  );
}
