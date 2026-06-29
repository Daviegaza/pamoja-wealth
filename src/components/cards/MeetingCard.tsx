import { Calendar, Clock, MapPin, Users, Video, ExternalLink, Check, X } from "lucide-react";
import type { Meeting } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

interface MeetingCardProps {
  meeting: Meeting;
  onRsvp?: (status: "attending" | "declined") => void;
  userRsvp?: "attending" | "declined" | null;
}

export function MeetingCard({ meeting, onRsvp, userRsvp }: MeetingCardProps) {
  const isVirtualLink = meeting.isVirtual && meeting.location.startsWith("http");
  const showRsvp = (meeting.status === "scheduled" || meeting.status === "ongoing") && onRsvp;
  const attendeePercent = meeting.totalInvited > 0 ? Math.round((meeting.attendeesCount / meeting.totalInvited) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-hover p-6 border-l-4 border-l-brand-500/0 hover:border-l-brand-500/70"
    >
      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-base text-gray-900 dark:text-white leading-snug">{meeting.title}</h3>
        <Badge variant={statusVariant[meeting.status]} dot={statusDot[meeting.status]} className="capitalize shrink-0">
          {meeting.status}
        </Badge>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{meeting.description}</p>
      )}

      {/* Meta info: date, time, location */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-brand-500" /> {formatDate(meeting.date)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-brand-500" /> {meeting.time}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1.5 font-medium">
          {meeting.isVirtual ? <Video className="h-3.5 w-3.5 text-brand-500" /> : <MapPin className="h-3.5 w-3.5 text-brand-500" />}{" "}
          {isVirtualLink ? "Virtual" : meeting.location}
        </span>
      </div>

      {/* Attendee count with mini progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-brand-500" />
            Attendees
          </span>
          <span>
            {meeting.attendeesCount} attending / {meeting.totalInvited} invited
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
            style={{ width: `${Math.min(attendeePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Agenda preview */}
      {meeting.agenda.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Agenda</p>
          <ul className="space-y-0.5">
            {meeting.agenda.slice(0, 2).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
            {meeting.agenda.length > 2 && (
              <li className="text-xs text-gray-400 dark:text-gray-500">+{meeting.agenda.length - 2} more items</li>
            )}
          </ul>
        </div>
      )}

      {/* Virtual meeting join link */}
      {isVirtualLink && (
        <a
          href={meeting.location}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          <Video className="h-3.5 w-3.5" />
          Join Meeting
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {/* RSVP buttons */}
      {showRsvp && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center gap-3">
          {userRsvp === "attending" ? (
            <Button
              size="sm"
              variant="success"
              leftIcon={<Check className="h-3.5 w-3.5" />}
              onClick={() => onRsvp("attending")}
            >
              Attending
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Check className="h-3.5 w-3.5" />}
              onClick={() => onRsvp("attending")}
            >
              Attend
            </Button>
          )}
          {userRsvp === "declined" ? (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={() => onRsvp("declined")}
            >
              Declined
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={() => onRsvp("declined")}
            >
              Decline
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
