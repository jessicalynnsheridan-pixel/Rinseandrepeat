import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Rinse & Repeat CEO',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#7C3AED] hover:underline mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold text-[#18181B] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#A1A1AA] mb-10">Last updated: May 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-[#3F3F46] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using Rinse &amp; Repeat CEO (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">2. Description of Service</h2>
            <p>
              Rinse &amp; Repeat CEO is a business coaching and productivity platform for entrepreneurs. It provides roadmaps, tools, AI assistance, habit tracking, and community features to help you build and grow your business.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use this Service. You agree to provide accurate information when creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">4. Subscriptions and Billing</h2>
            <p>
              Some features require a paid subscription. Subscriptions are billed in advance on a monthly or annual basis. You may cancel at any time and retain access until the end of your billing period. We do not offer refunds for partial billing periods unless required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Share your account credentials with others</li>
              <li>Scrape, copy, or redistribute our content without permission</li>
              <li>Post harmful, offensive, or misleading content in community features</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">6. Intellectual Property</h2>
            <p>
              All content, roadmaps, templates, and materials provided through the Service are owned by Rinse &amp; Repeat CEO and are protected by copyright. You may not reproduce or distribute them without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that any business strategy, roadmap, or advice will result in specific outcomes. Results vary based on individual effort and circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Rinse &amp; Repeat CEO shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">9. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">10. Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:support@rinseandrepeatceo.com" className="text-[#7C3AED] hover:underline">
                support@rinseandrepeatceo.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
