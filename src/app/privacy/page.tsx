import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Rinse & Repeat CEO',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#7C3AED] hover:underline mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold text-[#18181B] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#A1A1AA] mb-10">Last updated: May 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-[#3F3F46] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">1. What We Collect</h2>
            <p>When you use Rinse &amp; Repeat CEO, we collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account information</strong> - your name, email address, and password</li>
              <li><strong>Profile data</strong> - business type, goals, and onboarding responses you provide</li>
              <li><strong>Usage data</strong> - habits, revenue logs, roadmap progress, and XP earned</li>
              <li><strong>Community content</strong> - posts and interactions you make in the community</li>
              <li><strong>Payment information</strong> - processed securely by Stripe; we never store card details</li>
              <li><strong>AI conversations</strong> - messages sent to the AI assistant to provide responses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">2. How We Use Your Data</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide and personalise the Service</li>
              <li>Process payments and manage your subscription</li>
              <li>Send important account and product updates</li>
              <li>Improve the platform based on usage patterns</li>
              <li>Respond to support requests</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely using Supabase (PostgreSQL) hosted on AWS infrastructure. Payment processing is handled by Stripe. AI features are powered by OpenAI - messages sent to the assistant are processed by OpenAI in accordance with their privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">4. Cookies</h2>
            <p>
              We use essential cookies to keep you signed in and maintain your session. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{' '}
              <a href="mailto:support@rinseandrepeatceo.com" className="text-[#7C3AED] hover:underline">
                support@rinseandrepeatceo.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account, your personal data is permanently removed within 30 days, except where we are required by law to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">7. Children</h2>
            <p>
              The Service is not directed at children under 18. We do not knowingly collect data from anyone under 18.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes via email or an in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#18181B] mb-3">9. Contact</h2>
            <p>
              Privacy questions? Email{' '}
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
