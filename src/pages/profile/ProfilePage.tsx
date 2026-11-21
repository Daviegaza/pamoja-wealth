import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { PageHeader, SectionTitle } from "@/components/records/ui";
import { useAuth } from "@/hooks/useAuth";
import { formatDay } from "@/lib/format";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="Profile" />
      <div className="flex items-center gap-4">
        <Avatar src={user.avatarUrl} name={user.fullName} size="lg" />
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
          <p className="text-sm text-gray-500">{user.email} · {user.phone}</p>
          <div className="mt-1 flex gap-2">
            <Badge variant={user.isVerified ? "success" : "warning"}>{user.isVerified ? "Phone verified" : "Not verified"}</Badge>
            <span className="text-xs text-gray-400 self-center">Member since {formatDay(user.createdAt)}</span>
          </div>
        </div>
      </div>
      <section>
        <SectionTitle>Your details</SectionTitle>
        <ProfileForm />
      </section>
    </div>
  );
}
