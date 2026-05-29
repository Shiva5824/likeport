/**
 * Single source of truth for site-wide metadata, contact details, and
 * social links. Edit values here to update them everywhere they appear
 * (footer, contact page, about page, privacy/terms pages, metadata, etc).
 *
 * Leave a field as an empty string ("") to hide that link site-wide.
 */
export const siteConfig = {
  /** Display name shown in the brand mark and metadata. */
  name: 'LikePort',
  /** Production URL of the site (no trailing slash). */
  url: 'https://likeport.vercel.app',
  /** Short tagline used on hero sections + Open Graph descriptions. */
  tagline:
    'Turn your Spotify Liked Songs into shareable playlists or download them as CSV.',

  /** Person/entity that operates the site. Shown in legal pages + about page. */
  owner: {
    /** Public-facing display name. Edit to show your real name or org. */
    name: 'Shiva Kumar M',
    /** Country for the legal-jurisdiction line in Terms of Service. */
    country: 'India',
  },

  /**
   * Contact details. The email is shown in the contact page, the privacy
   * policy ("how to request deletion") and the terms.
   */
  contact: {
    email: 'support@likeport.app',
  },

  /**
   * Social / external links. Set to "" (empty string) to hide an icon.
   * The contact page renders one icon per non-empty entry.
   */
  socials: {
    github: 'https://github.com/Shiva5824',
    telegram: 'https://t.me/Shiva5824',
    instagram: 'https://instagram.com/ShivaKumarxm',
    linkedin: 'https://www.linkedin.com/in/shiva-kumar-mudavath-068298251/',
    /** Email is rendered as a `mailto:` icon alongside the rest. */
    email: 'mailto:support@likeport.in',
  },

  /**
   * Date the legal pages were last updated. Used in privacy + terms.
   * Format: YYYY-MM-DD.
   */
  legalUpdated: '2026-05-29',
} as const;

export type SiteConfig = typeof siteConfig;
