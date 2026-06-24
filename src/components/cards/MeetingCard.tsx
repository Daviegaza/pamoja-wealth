import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import type { Meeting } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const statusVariant: Record<Meeting["status"], "info" | "success" | "default" | "danger"> = {
  scheduled: "info",
  ongoing: "success",
  completed: "default",
  cancelled: "danger",
};

const statusDot: Record<Meeting["status"], boolean> = {
  scheduled: true,
  ongoing: true,
  completed: false,
  cancelled: false,
};

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card-hover p-5 border-l-4 border-l-brand-500/0 hover:border-l-brand-500/70">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{meeting.title}</h3>
        <Badge variant={statusVariant[meeting.status]} dot={statusDot[meeting.status]} className="capitalize">
          {meeting.status}
        </Badge>
      </div>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{meeting.description}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-brand-500" /> {formatDate(meeting.date)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-brand-500" /> {meeting.time}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          {meeting.isVirtual ? <Video className="h-3.5 w-3.5 text-brand-500" /> : <MapPin className="h-3.5 w-3.5 text-brand-500" />} {meeting.location}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          <Users className="h-3.5 w-3.5 text-brand-500" /> {meeting.attendeesCount}/{meeting.totalInvited}
        </span>
      </div>
    </motion.div>
  );
}
