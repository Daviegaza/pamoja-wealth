import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-8xl font-black text-gradient-hero">404</p>
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button leftIcon={<Home className="h-4 w-4" />} variant="premium">
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button leftIcon={<Search className="h-4 w-4" />} variant="outline">
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
