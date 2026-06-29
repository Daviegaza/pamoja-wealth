import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-6 py-16 lg:py-24 space-y-10"
    >
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] text-brand-600">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Terms of Service</h1>
        </div>
        <p className="text-sm text-gray-400">Last updated: June 2026</p>
      </section>

      <section className="space-y-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using the Pamoja Wealth platform (&quot;the Service&quot;), you
            agree to be bound by these Terms of Service. If you are using the Service on behalf
            of a chama or organization, you represent that you have authority to bind that group
            to these terms.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. Description of Service</h2>
          <p>
            Pamoja Wealth is a platform for managing chamas, savings groups, and investment clubs.
            Features include contribution tracking, loan management, investment monitoring, meeting
            scheduling, voting, treasury reporting, and analytics. The platform is provided as a
            software service and does not itself hold, transfer, or manage funds.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials.
            You must provide accurate, current, and complete information during registration.
            You may not share your account credentials or use another member&apos;s account.
            You must be at least 18 years old to use the Service.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Service for illegal or unauthorized purposes</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Interfere with the operation of the Service</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Use the Service to harass, abuse, or harm others</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">5. Financial Disclaimer</h2>
          <p>
            Pamoja Wealth is a record-keeping and management platform. We do not hold, custody,
            or transfer funds. All financial transactions occur through third-party payment
            providers (M-Pesa, banks, card processors). Pamoja Wealth is not a bank, SACCO,
            or licensed financial institution. The accuracy of financial records depends on
            member-reported data and integration with payment providers.
          </p>
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            Important: This is currently a demonstration version. No real financial transactions
            are processed. Do not enter real financial credentials or sensitive data.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Pamoja Wealth shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of the
            Service. Our total liability is limited to the fees paid by you in the 12 months
            preceding the claim.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">7. Termination</h2>
          <p>
            You may terminate your account at any time. We reserve the right to suspend or
            terminate accounts that violate these terms. Upon termination, we will export your
            data upon request within 30 days.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be communicated
            via email and in-app notification at least 30 days before taking effect. Continued
            use after changes constitutes acceptance.
          </p>
        </div>
      </section>
    </motion.div>
  );
}
