import { profile } from "@/content";
import { Section } from "@/components/ui/section";
import { isPlaceholder } from "@/lib/format";

export function Contact() {
  const secondary = [
    ...profile.links.filter((link) => link.label !== "Email"),
    { label: "Download résumé", href: profile.resumeUrl, handle: profile.resumeUrl },
  ];

  return (
    <Section id="contact" title="Contact">
      <div>
        <p className="text-step-0 text-ink-2 max-w-measure">{profile.lookingFor}</p>

        <p className="mt-8">
          <a
            href={`mailto:${profile.email}`}
            className="text-step-3 hover:text-accent font-medium tracking-[-0.02em] transition-colors"
          >
            {profile.email}
          </a>
        </p>

        <ul className="text-step-0 mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {secondary.map((link) => (
            <li key={link.label}>
              {isPlaceholder(link.href) ? (
                <span className="text-ink-3">{link.label}</span>
              ) : (
                <a
                  href={link.href}
                  className="text-ink-2 hover:text-accent underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
