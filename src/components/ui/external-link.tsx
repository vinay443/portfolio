import type { ReactNode } from "react";

/**
 * Every off-site link goes through here. `target="_blank"` needs
 * `rel="noopener noreferrer"` so the opened tab cannot reach back through
 * `window.opener`, and the accessible name has to say the tab is new — a screen
 * reader gets no other warning before focus lands somewhere else.
 *
 * `label` is the plain-text destination and is announced before that warning, so
 * it must contain the visible text of `children` (WCAG 2.5.3, Label in Name).
 *
 * A `mailto:` link is not an off-site link in this sense and must not use this:
 * opening a mail client in a new tab leaves an empty one behind.
 */
export function ExternalLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={className}
    >
      {children}
    </a>
  );
}
