import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { getMockDatabase } from "@/mock";

const { users } = getMockDatabase();

const QUOTES = [
  "Pamoja Wealth transformed how our chama tracks contributions. No more spreadsheet errors or chasing members for payments.",
  "The loan approval workflow saved us hours every month. Our treasurer finally has peace of mind.",
  "Seeing our investment growth in real time has motivated our members to contribute more consistently.",
  "The AI assistant answers questions our members used to ask in endless WhatsApp threads.",
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          Testimonials
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          Loved by chama leaders everywhere
        </motion.h2>
      </div>
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {QUOTES.map((q, idx) => {
          const user = users[idx + 1];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              className="card-hover p-6 gradient-border"
            >
              <Quote className="h-5 w-5 text-brand-300 dark:text-brand-700 mb-1" />
              <div className="flex gap-0.5 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">&ldquo;{q}&rdquo;</p>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.04] flex items-center gap-3">
                <Avatar src={user?.avatarUrl} name={user?.fullName ?? "Member"} size="sm" ring="brand" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user?.role.replace("_", " ")}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
