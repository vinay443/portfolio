import { profile } from "@/content";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-measure px-6 py-section">
      <h1 className="text-step-4 font-semibold">{profile.name}</h1>
      <p className="text-ink-2 text-step-1 mt-2">{profile.role}</p>
      <p className="text-ink-3 text-step-neg1 mt-8">
        Sections and components are built in a later step.
      </p>
    </main>
  );
}
