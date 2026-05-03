import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – Dhaka Chronicles',
  description: 'How Dhaka Chronicles collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly, such as your name and email when you subscribe to our newsletter, submit a comment, or contact us. We also collect information automatically, including your IP address, browser type, pages visited, time spent on pages, and referring URLs. We use cookies and similar tracking technologies to improve your experience.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to deliver, maintain and improve our services; send you newsletters and breaking news alerts you have subscribed to; respond to your comments and enquiries; analyse traffic and usage patterns; detect and prevent fraud or abuse; and comply with legal obligations.`,
    },
    {
      title: '3. Cookies',
      content: `We use essential cookies for site functionality, analytics cookies (Google Analytics) to understand usage, and preference cookies to remember your settings such as language choice. You can control cookies through your browser settings. Blocking certain cookies may affect site functionality.`,
    },
    {
      title: '4. Data Sharing',
      content: `We do not sell your personal data. We may share data with trusted third-party service providers who help us operate our website (e.g., hosting, analytics, email delivery), under strict data processing agreements. We may disclose information when required by law.`,
    },
    {
      title: '5. Data Retention',
      content: `We retain your personal data for as long as necessary to provide our services or as required by law. Newsletter subscriber data is retained until you unsubscribe. Comment data is retained unless you request deletion.`,
    },
    {
      title: '6. Your Rights',
      content: `You have the right to access, correct, or delete your personal data; object to or restrict processing; data portability; and withdraw consent at any time. To exercise these rights, contact us at privacy@dhakachronicles.com. We will respond within 30 days.`,
    },
    {
      title: '7. Security',
      content: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Our platform uses HTTPS encryption and follows security best practices.`,
    },
    {
      title: '8. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or by email. Continued use of our services after changes constitutes acceptance of the updated policy.`,
    },
    {
      title: '9. Contact',
      content: `For privacy-related enquiries, contact our team at: privacy@dhakachronicles.com`,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Legal</span>
        <h1 className="font-headline font-black text-dc-text text-4xl mt-2 mb-3">Privacy Policy</h1>
        <p className="text-dc-text-muted text-sm">Last updated: April 2026</p>
      </div>

      <div className="glass p-8 rounded-2xl space-y-8">
        <p className="text-dc-text leading-relaxed">
          Dhaka Chronicles ("we", "us", "our") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information
          when you visit dhakachronicles.com.
        </p>

        {sections.map(section => (
          <div key={section.title}>
            <h2 className="font-headline font-bold text-dc-text text-lg mb-2">{section.title}</h2>
            <p className="text-dc-text leading-relaxed text-sm">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
