import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChamaContext } from "./ChamaWorkspace";
import { changeMemberRole, createInviteCode, listInviteCodes, listMembers, removeMember } from "@/api/chama";
import { Empty, LoadError, Loading, PageHeader, SectionTitle, Table, td, th } from "@/components/records/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatDay } from "@/lib/format";
import { ROLE_LABELS, isChair, isOfficer, isSecretarial, normalizeRole, type ChamaRole } from "@/lib/roles";
import { apiErrorCode, apiErrorMessage } from "@/lib/download";

export default function MembersTab() {
  const { chama, role } = useChamaContext();
  const { user } = useAuth();
  const qc = useQueryClient();
  const members = useQuery({ queryKey: ["members", chama.id], queryFn: () => listMembers(chama.id) });
  const chair = isChair(role);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["members", chama.id] });
    void qc.invalidateQueries({ queryKey: ["chama", chama.id] });
  };

  const setRole = useMutation({
    mutationFn: (v: { userId: string; role: ChamaRole }) => changeMemberRole(chama.id, v.userId, v.role),
    onSuccess: () => {
      toast.success("Role updated");
      refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not change role.")),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeMember(chama.id, userId),
    onSuccess: () => {
      toast.success("Member removed. Their past records are kept.");
      refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not remove member.")),
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Members" description="Roles decide who can record money, run meetings and manage members." />

      {isSecretarial(role) && <InviteSection />}

      <section>
        <SectionTitle>Members</SectionTitle>
        {members.isLoading ? (
          <Loading />
        ) : members.isError ? (
          <LoadError message={apiErrorMessage(members.error, "Could not load members.")} onRetry={() => members.refetch()} />
        ) : (members.data?.length ?? 0) === 0 ? (
          <Empty title="No members yet" />
        ) : (
          <Table caption="Chama members">
            <thead>
              <tr>
                <th className={th}>Name</th>
                {isOfficer(role) && <th className={th}>Phone</th>}
                <th className={th}>Role</th>
                <th className={th}>Joined</th>
                <th className={th}>Status</th>
                {chair && <th className={th}><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {members.data!.map((m) => {
                const self = m.userId === user?.id;
                return (
                  <tr key={m.membershipId}>
                    <td className={td}>{m.fullName}{self && <span className="ml-1 text-xs text-gray-400">(you)</span>}</td>
                    {isOfficer(role) && <td className={`${td} tabular-nums`}>{m.phone ?? "—"}</td>}
                    <td className={td}>
                      {chair && !self && m.status === "active" ? (
                        <div className="w-40">
                          <Select
                            aria-label={`Role for ${m.fullName}`}
                            value={normalizeRole(m.role)}
                            disabled={setRole.isPending}
                            onChange={(e) => setRole.mutate({ userId: m.userId, role: e.target.value as ChamaRole })}
                            options={(Object.keys(ROLE_LABELS) as ChamaRole[]).map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                          />
                        </div>
                      ) : (
                        ROLE_LABELS[normalizeRole(m.role)]
                      )}
                    </td>
                    <td className={td}>{formatDay(m.joinedAt)}</td>
                    <td className={td}><Badge variant={m.status === "active" ? "success" : "default"}>{m.status}</Badge></td>
                    {chair && (
                      <td className={`${td} text-right`}>
                        {!self && m.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            isLoading={remove.isPending && remove.variables === m.userId}
                            onClick={() => {
                              if (window.confirm(`Remove ${m.fullName} from ${chama.name}? Their past records stay in the books.`)) remove.mutate(m.userId);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

function InviteSection() {
  const { chama } = useChamaContext();
  const qc = useQueryClient();
  const codes = useQuery({ queryKey: ["invite-codes", chama.id], queryFn: () => listInviteCodes(chama.id) });
  const create = useMutation({
    mutationFn: () => createInviteCode(chama.id, 14),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["invite-codes", chama.id] }),
    onError: (err) =>
      toast.error(apiErrorCode(err) === "PLAN_LIMIT" ? "Your plan's member limit is reached. Upgrade under Billing." : apiErrorMessage(err)),
  });

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy — select the code and copy it manually.");
    }
  };

  return (
    <section>
      <SectionTitle actions={<Button size="sm" variant="outline" isLoading={create.isPending} onClick={() => create.mutate()}>New invite code</Button>}>
        Invite members
      </SectionTitle>
      <p className="text-sm text-gray-500 mb-3">Share a code with a new member. They sign up, choose “Join a chama” and enter it. Codes expire after 14 days.</p>
      {codes.isLoading ? (
        <Loading />
      ) : codes.isError ? (
        <LoadError message={apiErrorMessage(codes.error, "Could not load invite codes.")} onRetry={() => codes.refetch()} />
      ) : (codes.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-gray-500">No active codes.</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {codes.data!.map((c) => (
            <li key={c.code} className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/[0.08] px-3 py-2">
              <span className="font-mono text-base font-semibold tracking-widest select-all">{c.code}</span>
              <span className="text-xs text-gray-500">{c.expiresAt ? `until ${formatDay(c.expiresAt)}` : "no expiry"}</span>
              <button onClick={() => void copy(c.code)} aria-label={`Copy code ${c.code}`} className="rounded p-1 text-gray-400 hover:text-gray-700 focus-ring">
                <Copy className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
