import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-6 py-16 lg:py-24 space-y-10"
    >
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] text-brand-600">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-sm text-gray-400">Last updated: June 2026</p>
      </section>

      <section className="space-y-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. Information We Collect</h2>
          <p>
            Pamoja Wealth collects information you provide when creating an account, including your
            name, email address, phone number, and location. When you use the platform, we also
            collect transaction data, contribution records, loan applications, investment activity,
            meeting participation, and voting history to provide our services.
          </p>
          <p>
            We do not collect sensitive financial credentials such as bank passwords, M-Pesa PINs,
            or full bank account numbers. Payment processing is handled by trusted third-party
            providers and we never store your complete payment instrument details.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. How We Use Your Data</h2>
          <p>Your data is used exclusively to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and improve the Pamoja Wealth platform</li>
            <li>Process contributions, loans, and investment transactions</li>
            <li>Generate reports and analytics for your chama</li>
            <li>Send notifications about chama activity, meetings, and votes</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
          <p>
            We will never sell your personal data to third parties. Your financial data belongs to
            you and your chama — we process it only on your behalf.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. Data Sharing</h2>
          <p>
            Within your chama, transaction data and contribution records are visible to other
            members as configured by your group&apos;s privacy settings. Group treasurers and
            chairpersons have access to financial reports needed for their roles. You control
            what personal information is visible to other members through your profile settings.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS),
            encryption at rest, access controls, and regular security audits. However, no electronic
            transmission or storage is 100% secure. We continuously work to protect your data but
            cannot guarantee absolute security.
          </p>
          <p>
            Note: As this is currently a demonstration platform, production-grade security
            infrastructure (HSMs, KMS, SIEM, dedicated WAF) will be deployed before handling
            real financial data.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access and download all data associated with your account</li>
            <li>Correct inaccurate personal information</li>
            <li>Delete your account and associated data</li>
            <li>Export your transaction history</li>
            <li>Withdraw consent for non-essential data processing</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">6. Contact</h2>
          <p>
            Questions about this Privacy Policy? Contact us at{" "}
            <a href="mailto:privacy@pamojawealth.com" className="text-brand-600 hover:text-brand-700">
              privacy@pamojawealth.com
            </a>
            .
          </p>
        </div>
      </section>
    </motion.div>
  );
}
