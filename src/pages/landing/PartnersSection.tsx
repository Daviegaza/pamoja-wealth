import { motion } from "framer-motion";

const PARTNERS = [
  { name: "M-Pesa", url: "https://www.safaricom.co.ke/personal/m-pesa" },
  { name: "Equity Bank", url: "https://equitygroupholdings.com" },
  { name: "KCB", url: "https://ke.kcbgroup.com" },
  { name: "NCBA", url: "https://ncbagroup.com" },
  { name: "Sanlam", url: "https://www.sanlam.co.ke" },
  { name: "CIC Insurance", url: "https://www.cic.co.ke" },
];

export function PartnersSection() {
  return (
    <section className="border-y border-gray-100/60 dark:border-white/[0.04] py-14 bg-gray-50/50 dark:bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-10"
        >
          Trusted to integrate with leading financial partners
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {PARTNERS.map((p, idx) => (
            <motion.a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="text-xl font-extrabold text-gray-300 dark:text-gray-700 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
            >
              {p.name}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
