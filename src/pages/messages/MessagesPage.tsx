import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Search, MessageSquare, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import {
  listConversations, getDmMessages, sendDm, markDmRead,
  type Conversation,
} from "@/api/dm";

export default function MessagesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const chamas = useChamaStore((s) => s.chamas);
  const [params, setParams] = useSearchParams();
  const activePeer = params.get("peer");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "groups" | "direct">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useQuery({
    queryKey: ["dm", "conversations"],
    queryFn: listConversations,
    refetchInterval: 5000,
  });

  const messagesQuery = useQuery({
    queryKey: ["dm", "messages", activePeer],
    queryFn: () => (activePeer ? getDmMessages(activePeer) : Promise.resolve([])),
    enabled: !!activePeer,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendDm(activePeer!, content),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["dm", "messages", activePeer] });
      qc.invalidateQueries({ queryKey: ["dm", "conversations"] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to send message.");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (peerId: string) => markDmRead(peerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dm", "conversations"] }),
  });

  useEffect(() => {
    if (activePeer) markReadMutation.mutate(activePeer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeer]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messagesQuery.data?.length]);

  const conversations: Conversation[] = conversationsQuery.data ?? [];
  const filtered = useMemo(
    () => conversations.filter((c) => c.peerName.toLowerCase().includes(query.toLowerCase())),
    [conversations, query]
  );
  const activeConv = conversations.find((c) => c.peerId === activePeer);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      <div className="card-base flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.04] space-y-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h1>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.04]">
            {(["all", "groups", "direct"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                  filterMode === mode
                    ? "bg-white dark:bg-white/[0.06] text-brand-600 dark:text-brand-400 shadow-soft-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chamas.length > 0 && filterMode !== "direct" && (
            <div className="bg-emerald-50/40 dark:bg-brand-500/[0.03]">
              <div className="px-3 pt-3 pb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-brand-700 dark:text-brand-400">
                <Users className="h-3 w-3" /> Chama groups · {chamas.length}
              </div>
              {chamas
                .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/chamas/${c.id}?tab=chat`)}
                    className="w-full text-left p-3 flex items-center gap-3 border-l-4 border-l-brand-500/70 hover:border-l-brand-500 hover:bg-brand-50/60 dark:hover:bg-brand-500/[0.06] transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient-brand shadow-soft-sm shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                        <Badge variant="brand" className="text-[9px] shrink-0">Group</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {c.memberCount} member{c.memberCount !== 1 ? "s" : ""} · Tap to open chat
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          )}
          {filterMode !== "groups" && (
            <div className="px-3 pt-3 pb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/[0.04] mt-2">
              <MessageSquare className="h-3 w-3" /> Direct messages · {conversations.length}
            </div>
          )}
          {filterMode !== "groups" && conversationsQuery.isLoading && (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
            </div>
          )}
          {filterMode !== "groups" && !conversationsQuery.isLoading && filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              {query ? "No matches." : "No direct messages yet."}
            </div>
          )}
          {filterMode !== "groups" && filtered.map((c) => (
            <button
              key={c.peerId}
              onClick={() => setParams({ peer: c.peerId })}
              className={`w-full text-left p-3 flex items-center gap-3 border-l-4 transition-colors ${
                activePeer === c.peerId
                  ? "bg-gray-100/70 dark:bg-white/[0.04] border-l-gray-400"
                  : "border-l-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              }`}
            >
              <Avatar src={c.peerAvatar ?? undefined} name={c.peerName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.peerName}</p>
                  <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(c.lastAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage}</p>
                  {c.unread > 0 && <Badge variant="brand" className="text-[10px] shrink-0">{c.unread}</Badge>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card-base flex flex-col overflow-hidden">
        {!activePeer ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Pick a chat from the left to view messages, or start a new one from someone's profile."
            />
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.04] flex items-center gap-3">
              <Avatar src={activeConv?.peerAvatar ?? undefined} name={activeConv?.peerName ?? "User"} size="md" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeConv?.peerName ?? "…"}</p>
                <p className="text-[11px] text-gray-400">Direct message</p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {messagesQuery.isLoading && (
                <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading messages…
                </div>
              )}
              {(messagesQuery.data ?? []).map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                        mine
                          ? "bg-brand-600 text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p className={`text-[10px] mt-0.5 ${mine ? "text-white/70" : "text-gray-400"}`}>
                        {formatRelativeTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) sendMutation.mutate(draft.trim());
              }}
              className="p-3 border-t border-gray-100 dark:border-white/[0.04] flex gap-2"
            >
              <input
                type="text"
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
              <Button type="submit" variant="premium" size="sm" disabled={!draft.trim() || sendMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
