import { profile } from "@/content";
import { isPlaceholder } from "@/lib/format";

const LINK_CLASSES = "text-ink-2 hover:text-accent underline-offset-4 hover:underline";

export function SiteFooter() {
  const links = [
    ...profile.links,
    ...(profile.resumeAvailable ? [{ label: "Download résumé", href: profile.resumeUrl }] : []),
  ];
  const repoConfirmed = !isPlaceholder(profile.repoUrl);

  return (
    <footer className="mt-section px-6 md:px-12 lg:px-20">
      <div className="border-rule max-w-column border-t py-10">
        <ul className="text-step-neg1 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={LINK_CLASSES}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-step-neg1 text-ink-3 mt-6">
          {repoConfirmed ? (
            <>
              This site is open source —{" "}
              <a href={profile.repoUrl} className={LINK_CLASSES}>
                view the repository
              </a>
              .
            </>
          ) : (
            "This site is open source."
          )}
        </p>
      </div>
    </footer>
  );
}
