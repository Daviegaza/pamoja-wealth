const PRACTICES = [
  {
    title: "No money to steal",
    desc: "Pamoja Wealth never holds chama funds. Your money stays in the chama's own M-Pesa or bank account, so a breach of our system cannot move it.",
  },
  {
    title: "Encrypted connections",
    desc: "The app and API are served over HTTPS only. Passwords are stored as salted hashes, never in plain text.",
  },
  {
    title: "Access by role, checked on the server",
    desc: "Every request is checked against your role in that specific chama. Members of one chama cannot read or change another chama's records.",
  },
  {
    title: "Audit log",
    desc: "Every change to contributions, loans, meetings and roles is logged with who made it and when. Entries are chained so tampering is detectable.",
  },
  {
    title: "Payments verified with the provider",
    desc: "Subscription payments are confirmed directly with Flutterwave or Paystack before a plan is activated — we never trust a browser redirect alone.",
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Security</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">How we protect your chama&apos;s records.</p>
      </header>
      <dl className="space-y-6">
        {PRACTICES.map((p) => (
          <div key={p.title}>
            <dt className="font-semibold text-gray-900 dark:text-white">{p.title}</dt>
            <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-gray-500">
        Found a security issue? Please report it through the Help page and do not disclose it publicly until we have fixed it.
      </p>
    </div>
  );
}
