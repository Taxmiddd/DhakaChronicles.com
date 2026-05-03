import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service – Dhaka Chronicles',
  description: 'Terms and conditions governing your use of Dhaka Chronicles.',
}

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using dhakachronicles.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.`,
    },
    {
      title: '2. Use of Content',
      content: `All content published on Dhaka Chronicles — including articles, images, graphics, and multimedia — is the intellectual property of Dhaka Chronicles or its contributors and is protected by copyright law. You may share our content with proper attribution and a link back to the original article. You may not reproduce, scrape, or republish our content in full without written permission.`,
    },
    {
      title: '3. User Submissions',
      content: `By submitting a comment, news tip, or other content, you grant Dhaka Chronicles a non-exclusive, worldwide, royalty-free licence to publish, edit, and distribute your submission. You represent that your submission is your own work and does not violate any third-party rights.`,
    },
    {
      title: '4. Prohibited Conduct',
      content: `You must not use our services to post defamatory, obscene, hateful, or illegal content; impersonate any person or entity; spam or use automated tools to access our services; interfere with the security or integrity of our platform; or violate any applicable laws.`,
    },
    {
      title: '5. Comments & Community',
      content: `We moderate comments to maintain a constructive, respectful environment. We reserve the right to remove any comment that violates our community standards. Repeated violations may result in banning from our platform.`,
    },
    {
      title: '6. Newsletter & Notifications',
      content: `By subscribing to our newsletter or push notifications, you consent to receiving communications from us. You can unsubscribe at any time via the link in any email or through your account settings.`,
    },
    {
      title: '7. Disclaimer of Warranties',
      content: `Our services are provided "as is" without warranties of any kind. We make reasonable efforts to ensure accuracy but do not warrant that content is error-free. Journalism involves interpretation and may contain errors of fact, which we correct promptly when identified.`,
    },
    {
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by law, Dhaka Chronicles shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.`,
    },
    {
      title: '9. Governing Law',
      content: `These terms are governed by the laws of the People's Republic of Bangladesh. Disputes shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.`,
    },
    {
      title: '10. Changes',
      content: `We may update these Terms from time to time. Continued use of our services following changes constitutes acceptance of the updated terms.`,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Legal</span>
        <h1 className="font-headline font-black text-dc-text text-4xl mt-2 mb-3">Terms of Service</h1>
        <p className="text-dc-text-muted text-sm">Last updated: April 2026</p>
      </div>

      <div className="glass p-8 rounded-2xl space-y-8">
        <p className="text-dc-text leading-relaxed">
          Please read these Terms of Service carefully before using Dhaka Chronicles.
          These terms apply to all visitors, readers, and contributors.
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
