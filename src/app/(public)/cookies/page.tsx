import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy – Dhaka Chronicles',
  description: 'Learn how Dhaka Chronicles uses cookies and similar technologies on our website.',
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Legal</span>
        <h1 className="font-headline font-black text-dc-text text-4xl mt-2 mb-3">Cookie Policy</h1>
        <p className="text-dc-text-muted text-sm">Last updated: May 2026</p>
      </div>

      <div className="glass p-8 rounded-2xl space-y-8">
        <p className="text-dc-text leading-relaxed">
          Dhaka Chronicles uses cookies and similar technologies to enhance your experience on our website.
          This policy explains what cookies are, how we use them, and how you can control them.
        </p>

        {[
          {
            title: '1. What Are Cookies?',
            content: 'Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently and to provide information to website operators.',
          },
          {
            title: '2. How We Use Cookies',
            content: 'We use essential cookies for site functionality (authentication, security, language), analytics cookies to understand usage patterns, and preference cookies to remember your settings such as dark/light mode.',
          },
          {
            title: '3. Third-Party Cookies',
            content: 'Some pages may contain content from third parties (YouTube videos, social media embeds) that set their own cookies. We do not control these cookies. Please refer to the respective privacy policies of Google Analytics, Hotjar, OneSignal, and YouTube.',
          },
          {
            title: '4. Your Cookie Choices',
            content: 'You can control cookies through your browser settings. Most browsers allow you to refuse or delete cookies. However, disabling essential cookies may affect the website\'s functionality. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on.',
          },
          {
            title: '5. Updates to This Policy',
            content: 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.',
          },
          {
            title: '6. Contact Us',
            content: 'If you have questions about our use of cookies, please contact us at privacy@dhakachronicles.com.',
          },
        ].map(section => (
          <div key={section.title}>
            <h2 className="font-headline font-bold text-dc-text text-lg mb-2">{section.title}</h2>
            <p className="text-dc-text leading-relaxed text-sm">{section.content}</p>
          </div>
        ))}

        {/* Third-party table */}
        <div>
          <h3 className="font-headline font-semibold text-dc-text text-base mb-3">Third-Party Services</h3>
          <div className="overflow-x-auto">
            <table className="dc-table text-sm">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Policy</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Google Analytics 4', purpose: 'Analytics', href: 'https://policies.google.com/privacy', label: 'Google' },
                  { name: 'Hotjar', purpose: 'Heatmaps', href: 'https://www.hotjar.com/legal/policies/privacy/', label: 'Hotjar' },
                  { name: 'OneSignal', purpose: 'Push notifications', href: 'https://onesignal.com/privacy_policy', label: 'OneSignal' },
                  { name: 'YouTube', purpose: 'Video embeds', href: 'https://policies.google.com/privacy', label: 'Google' },
                ].map(row => (
                  <tr key={row.name}>
                    <td className="text-dc-text">{row.name}</td>
                    <td className="text-dc-text-muted">{row.purpose}</td>
                    <td>
                      <a href={row.href} target="_blank" rel="noopener noreferrer"
                        className="text-dc-green hover:underline underline-offset-2">
                        {row.label}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
