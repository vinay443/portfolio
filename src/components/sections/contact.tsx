import { ArrowRight } from "lucide-react";
import { profile, siteLinks } from "@/content";
import { ExternalLink } from "@/components/ui/external-link";
import { Section } from "@/components/ui/section";

const LINK_CLASSES = "text-ink-2 hover:text-accent underline-offset-4 hover:underline";

// The call to action lives here, so this is the only place GitHub and LinkedIn
// render. The footer carries the repository line and nothing else, or the same two
// links would appear twice within one screen at the bottom of the page.
const profiles = [
  { label: "GitHub", href: siteLinks.github },
  { label: "LinkedIn", href: siteLinks.linkedin },
];

/**
 * `lookingFor` opens with the availability sentence and then says what the work is.
 * Only that first sentence is the claim a recruiter has to read, so it is set apart
 * instead of running as one block of body copy. Split here rather than in the content
 * layer: it is a matter of how this section reads, and the string stays one sentence
 * followed by its qualifier everywhere else it is used. Text with no sentence break
 * renders whole, at the larger size.
 */
function splitClaim(text: string): [string, string | null] {
  const breakAt = text.indexOf(". ");
  if (breakAt === -1) return [text, null];
  return [text.slice(0, breakAt + 1), text.slice(breakAt + 2)];
}

export function Contact() {
  const [claim, detail] = splitClaim(profile.lookingFor);

  return (
    <Section id="contact" title="Contact">
      {/* The last section on the page is the one whose bottom padding has nothing to
          separate it from: it stacks with the footer's own `mt-section`, so the closing
          link row sat two section gaps above the footer rule where every other section
          boundary gets one. Cancelling the padding from inside restores that rhythm
          without touching `Section`, which the other four sections share. */}
      <div className="-mb-section">
        <p className="text-step-2 max-w-measure text-balance">{claim}</p>

        {detail ? <p className="text-step-0 text-ink-2 max-w-measure mt-3">{detail}</p> : null}

        {/* The conversion point, so it gets the weight of a control rather than a line
            of copy: the same full-bleed hairline band, surface fill and accent hover as
            a project row, which is the only other thing on the site you click into.
            Deliberately not an ExternalLink: a mail client opened in a new tab leaves an
            empty tab behind. */}
        <a
          href={`mailto:${profile.email}`}
          className="group border-rule hover:bg-surface focus-visible:bg-surface -mx-4 mt-10 block border-y px-4 py-6 transition-colors duration-[120ms] md:py-8"
        >
          {/* The arrow rides the label row rather than sitting beside the address, so
              the address keeps the full column width. Next to it, a 320px screen has
              236px for 26 characters and breaks the address mid-word; a 375px one
              clears it by 7px, which the fallback face eats while the webfont swaps in. */}
          <span className="flex items-center justify-between gap-4">
            <span className="text-step-neg1 text-ink-3 font-mono">Email</span>

            {/* Decorative: the link is named by that label and the address below. */}
            <ArrowRight
              aria-hidden
              className="text-ink-3 group-hover:text-accent size-5 shrink-0 transition duration-[120ms] group-hover:translate-x-1"
            />
          </span>

          <span className="text-step-1 sm:text-step-2 group-hover:text-accent mt-1 block font-medium break-all transition-colors duration-[120ms]">
            {profile.email}
          </span>
        </a>

        <ul className="text-step-0 mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {profiles.map((link) => (
            <li key={link.label}>
              <ExternalLink
                href={link.href}
                label={`${link.label} profile`}
                className={LINK_CLASSES}
              >
                {link.label}
              </ExternalLink>
            </li>
          ))}
          {profile.resumeAvailable && (
            <li>
              {/* Same-origin file, so it stays in this tab. */}
              <a href={profile.resumeUrl} className={LINK_CLASSES}>
                Download résumé
              </a>
            </li>
          )}
        </ul>
      </div>
    </Section>
  );
}
