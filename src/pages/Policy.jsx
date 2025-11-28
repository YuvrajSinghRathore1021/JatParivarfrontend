import { useLang } from '../lib/useLang'

export default function Policy() {
    const { lang } = useLang()
    const langKey = lang === 'hi' ? 'hi' : 'en'

    return (
        <main className="bg-white">
            <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                <header className="space-y-3">
                    <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
                </header>

                <div className="text-lg text-slate-700 leading-relaxed space-y-6">

                    <p>
                        This Privacy Policy describes how Jat Parivar (“we”, “us”, “our”) collects, uses, stores and
                        protects your personal information when you use our Website https://jatparivar.org and related
                        Services. By using our Website, you agree to the collection and use of information in accordance
                        with this Policy.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">1. Scope</h2>
                    <ul className="list-disc pl-6">
                        <li>Visitors to our Website</li>
                        <li>Registered members and users</li>
                        <li>Users making payments for membership, donations, listings or other services</li>
                    </ul>
                    <p>
                        This Policy is intended to comply with applicable Indian laws, including the Digital Personal Data
                        Protection Act, 2023 and other relevant data protection rules.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">2. Information We Collect</h2>

                    <h3 className="font-semibold">a) Information You Provide Directly</h3>
                    <ul className="list-disc pl-6">
                        <li>Name, age, gender, and basic profile details</li>
                        <li>Contact information (mobile number, email address, postal address)</li>
                        <li>Community-related details you choose to share</li>
                        <li>Information for matrimony or job listings</li>
                        <li>Organisation or Dharamshala details</li>
                        <li>Messages, feedback or queries you send us</li>
                    </ul>

                    <h3 className="font-semibold mt-4">b) Payment Information</h3>
                    <ul className="list-disc pl-6">
                        <li>Transaction amount, date, time</li>
                        <li>Payment method and masked details from payment gateway</li>
                    </ul>
                    <p>
                        We do not store full card/bank details. Payments are securely handled by third-party providers such as PhonePe.
                    </p>

                    <h3 className="font-semibold mt-4">c) Automatically Collected Information</h3>
                    <ul className="list-disc pl-6">
                        <li>IP address and approximate location</li>
                        <li>Device, browser type, OS</li>
                        <li>Pages visited, time spent, referring URLs</li>
                        <li>Cookies and similar technologies</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">3. Cookies & Tracking Technologies</h2>
                    <p>
                        We use cookies to remember preferences, keep you logged in, analyse usage and improve the Website.
                        You may disable cookies from browser settings, but some features may not work properly.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">4. How We Use Your Information</h2>
                    <ul className="list-decimal pl-6 space-y-2">
                        <li>
                            <strong>To provide and improve our Services:</strong>
                            <ul className="list-disc pl-6">
                                <li>Create and manage accounts</li>
                                <li>Display directory listings</li>
                                <li>Enable payments and receipts</li>
                            </ul>
                        </li>
                        <li>
                            <strong>To communicate with you:</strong>
                            <ul className="list-disc pl-6">
                                <li>Send updates, confirmations and notifications</li>
                                <li>Respond to customer support</li>
                                <li>Important service announcements</li>
                            </ul>
                        </li>
                        <li>
                            <strong>For security & compliance:</strong>
                            <ul className="list-disc pl-6">
                                <li>Prevent fraud and abuse</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </li>
                        <li>
                            <strong>For analytics & improvements</strong>
                        </li>
                    </ul>
                    <p>We do NOT sell your personal data to third parties.</p>

                    <h2 className="text-2xl font-semibold mt-6">5. Legal Basis for Processing</h2>
                    <ul className="list-disc pl-6">
                        <li>Your consent</li>
                        <li>Contractual necessity</li>
                        <li>Legitimate interests</li>
                        <li>Legal obligations</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">6. Sharing of Your Information</h2>
                    <ul className="list-decimal pl-6 space-y-2">
                        <li>
                            <strong>Service Providers:</strong> PhonePe, hosting, email/SMS, IT providers.
                        </li>
                        <li>
                            <strong>Community Listings:</strong> Details you choose to publish may be visible publicly.
                        </li>
                        <li>
                            <strong>Legal Authorities:</strong> When required by law or court.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">7. Data Retention</h2>
                    <p>
                        We retain your data as long as your account is active, services are provided, or applicable laws
                        require retention.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">8. Data Security</h2>
                    <p>
                        We use secure server infrastructure, restricted data access, and trusted payment gateways.
                        However, no online system is 100% secure.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">9. Your Rights & Choices</h2>
                    <ul className="list-disc pl-6">
                        <li>Access your data</li>
                        <li>Request corrections</li>
                        <li>Request deletion</li>
                        <li>Withdraw consent</li>
                        <li>Object to processing</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">10. Children’s Privacy</h2>
                    <p>
                        Services are not intended for children under 18 for paid/contractual activities. If data is
                        collected unintentionally, we delete it.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">11. Changes to This Policy</h2>
                    <p>
                        We may update this Policy from time to time. Continued use of the Website means you accept the
                        updated Policy.
                    </p>

                </div>
            </div>
        </main>
    )
}
