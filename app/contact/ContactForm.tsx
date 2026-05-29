'use client';

/**
 * Client-side contact form. Builds a `mailto:` link from the form fields
 * and lets the user's email client take over. Avoids needing a backend +
 * SMTP credentials, which keeps the project stateless.
 */
import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Build a friendly mailto link with everything pre-filled.
    const lines = [
      `From: ${name || 'anonymous'} <${from || 'no-email'}>`,
      '',
      message,
    ];
    const url = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
      subject || `${siteConfig.name} feedback`,
    )}&body=${encodeURIComponent(lines.join('\n'))}`;
    window.location.href = url;
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <input
          required
          type="email"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="your@email.com"
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <input
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <textarea
        required
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What is on your mind?"
        className="rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accentHover"
      >
        Open in email client
      </button>
    </form>
  );
}
