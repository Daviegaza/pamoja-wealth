import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChamaContext } from "./ChamaWorkspace";
import { listMembers } from "@/api/chama";
import { downloadStatement, getStatement } from "@/api/statements";
import { Empty, LoadError, Loading, PageHeader, SectionTitle, Stat, Table, td, th } from "@/components/records/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDay, formatKes, statusLabel, statusVariant } from "@/lib/format";
import { isOfficer } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

export default function StatementsTab() {
  const { chama, role } = useChamaContext();
  const { user } = useAuth();
  const officer = isOfficer(role);
  const [scope, setScope] = useState<string>(user?.id ?? "chama");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);

  const members = useQuery({ queryKey: ["members", chama.id], queryFn: () => listMembers(chama.id), enabled: officer });
  const userId = scope === "chama" ? undefined : scope;
  const rangeInvalid = !!from && !!to && from > to;

  const statement = useQuery({
    queryKey: ["statement", chama.id, scope, from, to],
    queryFn: () => getStatement(chama.id, { from: from || undefined, to: to || undefined }, userId),
    enabled: !rangeInvalid,
  });

  const download = async (format: "csv" | "pdf") => {
    setDownloading(format);
    try {
      await downloadStatement(chama.id, format, { from: from || undefined, to: to || undefined }, userId);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not download the statement."));
    } finally {
      setDownloading(null);
    }
  };

  const scopeOptions = [
    ...(user ? [{ value: user.id, label: "My statement" }] : []),
    { value: "chama", label: "Whole chama" },
    ...(officer
      ? (members.data ?? []).filter((m) => m.userId !== user?.id).map((m) => ({ value: m.userId, label: m.fullName }))
      : []),
  ];

  const s = statement.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statements"
        description="Built only from records entered here. Download as CSV for spreadsheets or PDF to share at meetings."
        actions={
          <>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloading === "csv"} disabled={rangeInvalid || !!downloading} onClick={() => void download("csv")}>
              CSV
            </Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloading === "pdf"} disabled={rangeInvalid || !!downloading} onClick={() => void download("pdf")}>
              PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select label="Statement for" value={scope} onChange={(e) => setScope(e.target.value)} options={scopeOptions} />
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} error={rangeInvalid ? "“To” must be after “From”." : undefined} onChange={(e) => setTo(e.target.value)} />
      </div>

      {rangeInvalid ? null : statement.isLoading ? (
        <Loading />
      ) : statement.isError || !s ? (
        <LoadError message={apiErrorMessage(statement.error, "Could not load the statement.")} onRetry={() => statement.refetch()} />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Stat label="Contributions (excl. voided)" value={formatKes(s.totals.contributions)} />
            <Stat label="Loans issued" value={formatKes(s.totals.loansIssued)} />
            <Stat label="Loan repayments" value={formatKes(s.totals.repayments)} />
          </div>

          <section>
            <SectionTitle>Contributions</SectionTitle>
            {s.contributions.length === 0 ? (
              <Empty title="No contributions in this period" />
            ) : (
              <Table caption="Contributions in statement">
                <thead>
                  <tr>
                    <th className={th}>Date</th>
                    <th className={th}>Member</th>
                    <th className={th}>Amount</th>
                    <th className={th}>Receipt</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {s.contributions.map((c) => (
                    <tr key={c.id}>
                      <td className={td}>{formatDay(c.paidOn)}</td>
                      <td className={td}>{c.memberName}</td>
                      <td className={`${td} tabular-nums`}>{formatKes(c.amount)}</td>
                      <td className={`${td} font-mono text-xs`}>{c.mpesaReceipt ?? "—"}</td>
                      <td className={td}><Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>

          <section>
            <SectionTitle>Loans</SectionTitle>
            {s.loans.length === 0 ? (
              <Empty title="No loans in this period" />
            ) : (
              <Table caption="Loans in statement">
                <thead>
                  <tr>
                    <th className={th}>Issued</th>
                    <th className={th}>Borrower</th>
                    <th className={th}>Principal</th>
                    <th className={th}>Repaid</th>
                    <th className={th}>Balance</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {s.loans.map((l) => (
                    <tr key={l.id}>
                      <td className={td}>{formatDay(l.issuedOn)}</td>
                      <td className={td}>{l.borrowerName}</td>
                      <td className={`${td} tabular-nums`}>{formatKes(l.principal)}</td>
                      <td className={`${td} tabular-nums`}>{formatKes(l.amountRepaid)}</td>
                      <td className={`${td} tabular-nums`}>{formatKes(l.balance)}</td>
                      <td className={td}><Badge variant={statusVariant(l.status)}>{statusLabel(l.status)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
