import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { MemberCard } from "@/components/cards/MemberCard";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { useChamaStore } from "@/stores/chamaStore";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";

export default function MembersPage() {
  const members = useChamaStore((s) => s.members);
  const { query, setQuery, results } = useSearch(members, ["fullName", "role"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{members.length.toLocaleString()} members across all chamas</p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => toast.success("Invitation sent! Member will receive an SMS and email.")}>Invite Member</Button>
      </div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search members by name or role..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paginated.map((m) => <MemberCard key={m.id} member={m} />)}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
