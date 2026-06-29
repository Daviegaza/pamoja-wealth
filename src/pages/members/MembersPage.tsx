import { useState } from "react";
import { UserPlus, Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { MemberCard } from "@/components/cards/MemberCard";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/dialogs/Modal";
import { useChamaStore } from "@/stores/chamaStore";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";

export default function MembersPage() {
  const members = useChamaStore((s) => s.members);
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const displayMembers = activeChamaId ? members.filter((m) => m.chamaId === activeChamaId) : members;
  const { query, setQuery, results } = useSearch(displayMembers, ["fullName", "role"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 12);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateInviteCode = () => {
    const code = `PW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setInviteCode(code);
    setCopied(false);
    setInviteModalOpen(true);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Invite code copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{displayMembers.length.toLocaleString()} members in {activeChama?.name ?? "All Chamas"}</p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={generateInviteCode}>Invite Member</Button>
      </div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search members by name or role..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paginated.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState icon={Users} title="No members found" description="Invite members to join your chama." actionLabel="Invite Member" onAction={generateInviteCode} />
          </div>
        ) : (
          paginated.map((m) => <MemberCard key={m.id} member={m} />)
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Code" description="Share this code with a new member to join your chama.">
        <div className="flex items-center gap-3">
          <code className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] px-4 py-3 text-lg font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider select-all">
            {inviteCode}
          </code>
          <Button leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={copyToClipboard} variant="secondary" size="sm">
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
