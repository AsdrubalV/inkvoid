import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12 px-4">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-gray-400 hover:text-black transition">
          ← InkVoid
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: April 3, 2026</p>
      </div>

      <div className="rounded-2xl border border-border bg-white/70 p-8 space-y-8 text-sm text-gray-700 leading-relaxed">

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">1. Introduction</h2>
          <p>
            Inkvoid ("we", "our", or "the platform") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information, including data obtained through Google OAuth services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">2. Data We Access (Google User Data)</h2>
          <p>When users choose to sign in using Google, Inkvoid may access the following information:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>Email address</li>
            <li>Basic profile information (such as name, if provided by Google)</li>
          </ul>
          <p>We do not access sensitive Google data such as contacts, drive files, or other private content.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">3. Additional Data Collected</h2>
          <p>In addition to Google login data, Inkvoid may collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>Country or general location (for analytics purposes only)</li>
            <li>Platform usage data (e.g., reading activity, interactions, views)</li>
            <li>Content uploaded by users (stories, comments, etc.)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">4. How We Use Data</h2>
          <p>We use the collected data strictly for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>To create and manage user accounts</li>
            <li>To enable login functionality via Google OAuth</li>
            <li>To improve the platform experience</li>
            <li>To provide analytics to authors (e.g., views, engagement metrics)</li>
            <li>To monitor and maintain platform performance and security</li>
          </ul>
          <p>We do not use Google user data for advertising purposes outside the platform.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">5. Data Sharing</h2>
          <p>Inkvoid does not sell, rent, or share user data with third parties. Data may only be shared in the following limited cases:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>When required by law or legal process</li>
            <li>To protect the security and integrity of the platform</li>
          </ul>
          <p>No Google user data is shared with external services or third-party companies for commercial use.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">6. Data Storage and Protection</h2>
          <p>We implement appropriate technical and organizational measures to protect user data, including:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>Secure authentication systems</li>
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Restricted access to sensitive data</li>
          </ul>
          <p>We take reasonable steps to prevent unauthorized access, disclosure, or misuse of data.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">7. Data Retention</h2>
          <p>We retain user data only for as long as necessary to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>Provide our services</li>
            <li>Maintain platform functionality</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>If a user deletes their account, their personal data will be removed or anonymized within a reasonable timeframe.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">8. Data Deletion Requests</h2>
          <p>Users may request deletion of their data at any time by:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>Deleting their account directly from the platform settings</li>
            <li>Contacting us at: <a href="mailto:support@inkvoid.ink" className="underline hover:text-black">support@inkvoid.ink</a></li>
          </ul>
          <p>Upon request, we will permanently delete user data unless retention is required for legal reasons.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">9. Compliance with Google Policies</h2>
          <p>Inkvoid complies with:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>Google API Services User Data Policy</li>
            <li>Google APIs Terms of Service</li>
          </ul>
          <p>We only request access to the minimum data necessary for authentication and platform functionality.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">10. Contact</h2>
          <p>If you have any questions about this Privacy Policy, you can contact us at:</p>
          <p>
            <a href="mailto:support@inkvoid.ink" className="underline hover:text-black">
              support@inkvoid.ink
            </a>
          </p>
        </section>

      </div>

      <p className="text-xs text-center text-gray-400">
        InkVoid — {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}