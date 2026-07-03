import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap, MessageSquare, Calendar, Video, Webhook, Check, ExternalLink, Trash2, Plus } from "lucide-react";
const Slack = MessageSquare;
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/dialogs/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { api } from "@/api/axios";

type ProviderId = "slack" | "google_calendar" | "zoom" | "zapier" | "webhook" | "whatsapp_business" | "quickbooks" | "xero";

interface Provider {
  id: ProviderId;
  name: string;
  description: string;
  category: "chat" | "calendar" | "video" | "automation" | "accounting" | "messaging";
  authType: "oauth" | "api_key" | "webhook";
  icon: React.ReactNode;
}

interface Integration {
  id: string;
  provider: ProviderId;
  chamaId: string;
  connected: boolean;
  connectedAt?: string;
  displayName?: string;
  scopes?: string[];
}

const PROVIDERS: Provider[] = [
  { id: "slack", name: "Slack", description: "Post chama events to a Slack channel — contributions, meetings, votes.", category: "chat", authType: "oauth", icon: <Slack className="h-6 w-6" /> },
  { id: "google_calendar", name: "Google Calendar", description: "Sync meeting schedules to members' Google Calendars.", category: "calendar", authType: "oauth", icon: <Calendar className="h-6 w-6" /> },
  { id: "zoom", name: "Zoom", description: "Auto-create Zoom links for virtual meetings.", category: "video", authType: "oauth", icon: <Video className="h-6 w-6" /> },
  { id: "zapier", name: "Zapier", description: "Trigger 5,000+ apps on chama events via Zapier.", category: "automation", authType: "api_key", icon: <Zap className="h-6 w-6" /> },
  { id: "webhook", name: "Custom Webhooks", description: "Send JSON payloads to your own HTTPS endpoint for any event.", category: "automation", authType: "webhook", icon: <Webhook className="h-6 w-6" /> },
  { id: "whatsapp_business", name: "WhatsApp Business", description: "Send contribution reminders + receipts via WhatsApp (Meta Cloud API).", category: "messaging", authType: "api_key", icon: <div className="text-xl">💬</div> },
  { id: "quickbooks", name: "QuickBooks", description: "Export ledger to QuickBooks for accounting.", category: "accounting", authType: "oauth", icon: <div className="text-xl">📚</div> },
  { id: "xero", name: "Xero", description: "Export ledger to Xero.", category: "accounting", authType: "oauth", icon: <div className="text-xl">📗</div> },
];

async function listIntegrations(chamaId: string): Promise<Integration[]> {
  try {
    const r = await api.get<{ success: true; data: Integration[] }>(`/integrations`, { params: { chamaId } });
    return r.data.data;
  } catch {
    return [];
  }
}

async function connectIntegration(chamaId: string, provider: ProviderId, credentials?: Record<string, string>): Promise<{ redirectUrl?: string; ok: boolean }> {
  const r = await api.post<{ success: true; data: { redirectUrl?: string; ok: boolean } }>(`/integrations/${provider}/connect`, { chamaId, credentials });
  return r.data.data;
}

async function disconnectIntegration(id: string) {
  await api.delete(`/integrations/${id}`);
}

export default function IntegrationsPage() {
  const qc = useQueryClient();
  const [selectedChamaId] = useState<string>("");
  const [modalProvider, setModalProvider] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations", selectedChamaId],
    queryFn: () => listIntegrations(selectedChamaId),
  });

  const connectMut = useMutation({
    mutationFn: (args: { provider: ProviderId; credentials?: Record<string, string> }) =>
      connectIntegration(selectedChamaId, args.provider, args.credentials),
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.success("Integration connected");
        qc.invalidateQueries({ queryKey: ["integrations"] });
        setModalProvider(null);
      }
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Connection failed";
      toast.error(msg);
    },
  });

  const disconnectMut = useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => {
      toast.success("Disconnected");
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
  });

  const isConnected = (p: ProviderId) => integrations.some((i) => i.provider === p && i.connected);

  const onConnect = (provider: Provider) => {
    if (provider.authType === "oauth") {
      connectMut.mutate({ provider: provider.id });
    } else {
      setModalProvider(provider);
    }
  };

  const onSubmitCredentials = () => {
    if (!modalProvider) return;
    const credentials: Record<string, string> = {};
    if (modalProvider.authType === "api_key") credentials.apiKey = apiKey;
    if (modalProvider.authType === "webhook") credentials.url = webhookUrl;
    connectMut.mutate({ provider: modalProvider.id, credentials });
  };

  const grouped = PROVIDERS.reduce<Record<string, Provider[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5" /> Integrations
        </div>
        <h1 className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">Connect Pamoja to your stack</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-2xl">
          Post events to Slack, sync meetings to Google Calendar, auto-create Zoom rooms, export ledgers, and more.
        </p>
      </header>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{cat.replace("_", " ")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => {
              const connected = isConnected(p.id);
              const record = integrations.find((i) => i.provider === p.id);
              return (
                <div key={p.id} className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-brand-600 dark:text-brand-400">{p.icon}</div>
                    {connected && (
                      <Badge variant="success">
                        <Check className="h-3 w-3" /> Connected
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 min-h-[36px]">{p.description}</p>
                  <div className="mt-4 flex gap-2">
                    {connected && record ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`/integrations/${p.id}/manage`, "_blank")}>
                          <ExternalLink className="h-3.5 w-3.5" /> Manage
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => disconnectMut.mutate(record.id)} aria-label={`Disconnect ${p.name}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" size="sm" className="flex-1" onClick={() => onConnect(p)}>
                        <Plus className="h-3.5 w-3.5" /> Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {integrations.length === 0 && (
        <div className="mt-10">
          <EmptyState
            icon={Zap}
            title="No integrations yet"
            description="Pick a provider above to connect your first tool."
          />
        </div>
      )}

      <Modal isOpen={!!modalProvider} onClose={() => setModalProvider(null)} title={modalProvider ? `Connect ${modalProvider.name}` : ""}>
        {modalProvider?.authType === "api_key" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Paste your {modalProvider.name} API key. Encrypted at rest with AES-GCM.</p>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk_live_..." type="password" />
            <Button onClick={onSubmitCredentials} className="w-full" isLoading={connectMut.isPending}>Connect</Button>
          </div>
        )}
        {modalProvider?.authType === "webhook" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">HTTPS endpoint to receive JSON payloads. Signed with HMAC-SHA256; verify via `X-Pamoja-Signature` header.</p>
            <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhook" />
            <Button onClick={onSubmitCredentials} className="w-full" isLoading={connectMut.isPending}>Save webhook</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
