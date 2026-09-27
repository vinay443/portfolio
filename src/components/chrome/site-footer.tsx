import { siteLinks } from "@/content";
import { ExternalLink } from "@/components/ui/external-link";
import { isPlaceholder } from "@/lib/format";

const LINK_CLASSES = "text-ink-2 hover:text-accent underline-offset-4 hover:underline";

// One line only. Email, GitHub and LinkedIn belong to the Contact section directly
// above it; repeating them here put the same two links twice on one screen.
export function SiteFooter() {
  const repoConfirmed = !isPlaceholder(siteLinks.repo);

  return (
    <footer className="mt-section px-6 md:px-12 lg:px-20">
      <div className="border-rule max-w-column mx-auto border-t py-10">
        <p className="text-step-neg1 text-ink-3">
          {repoConfirmed ? (
            <>
              This site is open source —{" "}
              <ExternalLink
                href={siteLinks.repo}
                label="View the repository this site is built from, on GitHub"
                className={LINK_CLASSES}
              >
                view the repository
              </ExternalLink>
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
