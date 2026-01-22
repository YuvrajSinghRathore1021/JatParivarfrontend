import { useLang } from "../lib/useLang";

export default function Terms() {
  const { lang } = useLang();
  const langKey = lang === "hi" ? "hi" : "en";

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Terms and Conditions
          </h1>
          <p className="text-slate-500">Last updated: 25 November 2025</p>
        </header>

        {/* SECTION 1 */}
        <section className="space-y-4 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p>
            Welcome to Jat Parivar (the “Platform” / “Website”), accessible at
            https://jatparivar.org. This Website is owned and operated by
            Cambridge Multimedia Pvt. Ltd., having its office at Jat Bhawan,
            opposite Water Tanki, Sri Madhopur, Sikar, Rajasthan 332715.
          </p>
          <p>
            By accessing or using our Website, mobile site, or any related
            services (“Services”), you agree to be bound by these Terms &
            Conditions (“Terms”). If you do not agree with these Terms, please
            do not use the Website.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">2. Line of Business (LOB)</h2>
          <p>Jat Parivar is an online community portal that provides:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Community membership registration and management</li>
            <li>Community directory listings</li>
            <li>Matrimony and job listing services</li>
            <li>
              Information related to community events, scholarships, and
              initiatives
            </li>
            <li>
              Online collection of membership fees, contributions, and donations
              via digital payment methods
            </li>
          </ul>
          <p>We do not sell physical goods on this platform.</p>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-4 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold">3. Eligibility</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You must be at least 18 years old to use services involving payments or posting content.</li>
            <li>You represent that you have the legal capacity to enter into a binding contract as per Indian law.</li>
          </ol>
        </section>

        {/* SECTION 4 */}
        <section className="space-y-4 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold">4. Account Registration</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You may need to create an account to access certain features.</li>
            <li>You agree to provide accurate and complete information and keep it updated.</li>
            <li>You are responsible for maintaining confidentiality of login credentials.</li>
            <li>
              Notify us at <span className="font-semibold">jatektapatrika@gmail.com</span> for any unauthorized access.
            </li>
          </ol>
        </section>

        {/* SECTION 5 */}
        <section className="space-y-4 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold">5. Services on the Platform</h2>

          <p>You may perform the following on Jat Parivar:</p>

          <ul className="list-disc pl-6 space-y-1">
            <li>Register as a member under different membership categories</li>
            <li>Create and update your profile</li>
            <li>View directory listings</li>
            <li>Post information (subject to moderation)</li>
            <li>Make online payments for membership fees, donations, etc.</li>
          </ul>

          <p>We reserve the right to modify or discontinue services anytime.</p>
        </section>

        {/* SECTION 6 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">6. User Responsibilities & Community Guidelines</h2>

          <p>By using the Website, you agree not to:</p>

          <ul className="list-disc pl-6 space-y-1">
            <li>Post unlawful, abusive, hateful, or objectionable content</li>
            <li>Post misleading or fraudulent information</li>
            <li>Harass or threaten other users</li>
            <li>Attempt unauthorized access to the Website</li>
            <li>Interfere with Website functioning (viruses, bots, etc.)</li>
          </ul>

          <p>We may remove content or terminate accounts violating these rules.</p>
        </section>

        {/* SECTION 7 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">7. User Content & Intellectual Property</h2>

          <h3 className="text-xl font-semibold">1. User Content</h3>
          <p>
            Any content you upload remains your responsibility. You grant us a
            non-exclusive, royalty-free license to use and display it for platform
            operations.
          </p>

          <h3 className="text-xl font-semibold">2. Our Content</h3>
          <p>
            All Website content (text, graphics, images, software) is protected by
            intellectual property laws. You may not copy or distribute it without
            permission.
          </p>
        </section>

        {/* SECTION 8 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">8. Payments, Pricing & Taxes</h2>

          <ol className="list-decimal pl-6 space-y-1">
            <li>All fees are in Indian Rupees (INR).</li>
            <li>Payments may be collected through third-party gateways like PhonePe.</li>
            <li>You authorize us to process transactions via payment partners.</li>
            <li>Applicable taxes or gateway charges may apply.</li>
          </ol>
        </section>

        {/* SECTION 9 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">9. Refund & Cancellation Policy</h2>

          <ol className="list-decimal pl-6 space-y-2">
            <li>Membership fees and donations are non-refundable except in specific cases.</li>

            <li>A refund may be considered in situations such as:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Duplicate payment</li>
                <li>Technical issues where payment was made but service not activated</li>
                <li>Any genuine case at our discretion</li>
              </ul>
            </li>

            <li>Email refund requests to <span className="font-semibold">jatektapatrika@gmail.com</span> within 7 days.</li>
            <li>Refunds (if approved) will be initiated within 7 working days.</li>
            <li>No returns or shipping since no physical goods are delivered.</li>
          </ol>
        </section>

        {/* SECTION 10 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">10. Third-Party Services & Links</h2>

          <ol className="list-decimal pl-6 space-y-1">
            <li>Payments and services via third parties (e.g., PhonePe) follow their terms.</li>
            <li>External website links are not controlled or endorsed by us.</li>
          </ol>
        </section>

        {/* SECTION 11 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">11. Disclaimer of Warranties</h2>

          <ol className="list-decimal pl-6 space-y-1">
            <li>The Website is provided “as is” without warranties.</li>
            <li>No guarantee of error-free, secure, or uninterrupted operations.</li>
            <li>No guarantees about accuracy or reliability of listings or information.</li>
            <li>You use the Website at your own risk.</li>
          </ol>
        </section>

        {/* SECTION 12 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">12. Limitation of Liability</h2>

          <ol className="list-decimal pl-6 space-y-1">
            <li>We are not liable for indirect, incidental, or consequential damages.</li>
            <li>
              Total liability is limited to the amount paid by you (if any) in the
              last 6 months.
            </li>
          </ol>
        </section>

        {/* SECTION 13 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">13. Indemnity</h2>

          <p>You agree to indemnify and hold harmless Cambridge Multimedia Pvt. Ltd. from any claims arising due to:</p>

          <ul className="list-disc pl-6 space-y-1">
            <li>Your use of the Website</li>
            <li>Your violation of these Terms</li>
            <li>Your infringement of rights of another user or third party</li>
          </ul>
        </section>

        {/* SECTION 14 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">14. Termination</h2>

          <ol className="list-decimal pl-6 space-y-1">
            <li>We may suspend or terminate your access if Terms are violated.</li>
            <li>You may request account deletion by emailing
              <span className="font-semibold"> jatektapatrika@gmail.com</span>.
            </li>
            <li>Certain obligations (payments, indemnities) survive termination.</li>
          </ol>
        </section>

        {/* SECTION 15 */}
        <section className="space-y-4 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">15. Governing Law & Jurisdiction</h2>

          <p>
            These Terms are governed by the laws of India. Courts at Sikar,
            Rajasthan shall have exclusive jurisdiction over all disputes.
          </p>
        </section>

        {/* CONTACT */}
        <section className="space-y-2 text-lg leading-relaxed text-slate-700">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p>Email: jatektapatrika@gmail.com</p>
          <p>Phone: 7014217770</p>
        </section>

      </div>
    </main>
  );
}
