import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import { siteConfig } from '@/lib/site-config';
import { SocialIcon } from '@/components/SocialIcon';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: `Contact — ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} team.`,
};

/**
 * Contact page.
 *
 * Lists every social channel from `siteConfig.socials` and offers a simple
 * mailto-based form. Edit `lib/site-config.ts` to update any of these links.
 */
export default function ContactPage() {
  // Skip empty entries so the user can hide a channel by clearing it in config.
  const socials = (
    [
      ['github', 'GitHub', siteConfig.socials.github],
      ['telegram', 'Telegram', siteConfig.socials.telegram],
      ['instagram', 'Instagram', siteConfig.socials.instagram],
      ['linkedin', 'LinkedIn', siteConfig.socials.linkedin],
      ['email', 'Email', siteConfig.socials.email],
    ] as const
  ).filter(([, , href]) => href.length > 0);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-3 text-zinc-400">
          Found a bug, want a feature, or just want to say hi? Reach out on any
          of these channels and we will get back to you.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {socials.map(([kind, label, href]) => (
            <a
              key={kind}
              href={href}
              target={kind === 'email' ? undefined : '_blank'}
              rel={kind === 'email' ? undefined : 'noreferrer'}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-zinc-700"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-bg ring-1 ring-border text-zinc-200">
                <SocialIcon kind={kind} size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block truncate text-xs text-zinc-400">
                  {kind === 'email'
                    ? siteConfig.contact.email
                    : href.replace(/^https?:\/\//, '')}
                </span>
              </span>
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 text-zinc-500"
                fill="currentColor"
                aria-hidden
              >
                <path d="M5 3v2h8.59L3 15.59 4.41 17 15 6.41V15h2V3z" />
              </svg>
            </a>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Send a message</h2>
          <p className="mt-1 text-sm text-zinc-400">
            This form opens your email client with the message pre-filled. We
            do not collect or store anything on submit.
          </p>
          <ContactForm />
        </div>
      </div>
    </PublicLayout>
  );
}
