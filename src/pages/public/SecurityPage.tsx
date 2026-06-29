import { motion } from "framer-motion";
import { ShieldCheck, Lock, Server, FileKey, Bug, Eye } from "lucide-react";

const PRACTICES = [
  {
    icon: Lock,
    title: "Encryption",
    desc: "All data is encrypted in transit using TLS 1.3. Data at rest is encrypted using AES-256. API access requires bearer tokens with configurable expiry.",
  },
  {
    icon: ShieldCheck,
    title: "Authentication",
    desc: "Multi-factor authentication (MFA) is supported. Passwords are hashed using bcrypt. OTP-based verification is available for sensitive actions like withdrawals and admin changes.",
  },
  {
    icon: Server,
    title: "Infrastructure",
    desc: "Services run in isolated containers with least-privilege IAM policies. Regular security patches are applied automatically. Network access is restricted by firewall rules and IP allowlists.",
  },
  {
    icon: FileKey,
    title: "Data Privacy",
    desc: "Personal data is stored separately from financial transaction data. Chama-level data is logically isolated. Data residency options are available for regulatory compliance.",
  },
  {
    icon: Eye,
    title: "Audit & Monitoring",
    desc: "All sensitive actions are logged to an immutable audit trail. Anomaly detection monitors for unusual patterns. Security events trigger real-time alerts to platform administrators.",
  },
  {
    icon: Bug,
    title: "Vulnerability Management",
    desc: "Regular penetration testing is conducted by independent security firms. We maintain a responsible disclosure program. Critical vulnerabilities are patched within 24 hours.",
  },
];

export default function SecurityPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-6 py-16 lg:py-24 space-y-16"
    >
      <section className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/[0.08] text-brand-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Security</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          We take the security of your chama&apos;s data seriously. Here&apos;s how we protect it.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.06] px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Demo platform — production security infrastructure is under development
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRACTICES.map((p) => (
          <motion.div key={p.title} whileHover={{ y: -2 }} className="card-hover p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/[0.06] text-brand-600 dark:text-brand-400 mb-3">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="space-y-4 card-hover p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pre-Launch Security Roadmap</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>Before processing real financial data, the following will be deployed:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>SOC 2 Type II audit and certification</li>
            <li>Hardware Security Module (HSM) for key management</li>
            <li>Web Application Firewall (WAF) with custom rulesets</li>
            <li>DDoS protection and rate limiting at the edge</li>
            <li>Real-time fraud detection and transaction monitoring</li>
            <li>Dedicated 24/7 Security Operations Center (SOC)</li>
            <li>PCI DSS compliance for card payment processing</li>
            <li>GDPR and Kenya Data Protection Act compliance program</li>
          </ul>
        </div>
      </section>

      <section className="text-center space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Report a Vulnerability</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you discover a security issue, please contact us at{" "}
          <a href="mailto:security@pamojawealth.com" className="text-brand-600 hover:text-brand-700 font-medium">
            security@pamojawealth.com
          </a>
          . We aim to acknowledge reports within 24 hours and resolve critical issues within 72 hours.
        </p>
      </section>
    </motion.div>
  );
}
