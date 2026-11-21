import { useNavigate } from "react-router-dom";
import { Notice, PageHeader, SectionTitle } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ChamaList } from "@/pages/chamas/MyChamasPage";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const first = user?.fullName.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={first ? `Karibu, ${first}` : "Dashboard"}
        description="Your chamas' books in one place: contributions, loans, meetings and statements."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/chamas/join")}>Join with a code</Button>
            <Button onClick={() => navigate("/chamas/create")}>Create a chama</Button>
          </>
        }
      />
      <section>
        <SectionTitle>Your chamas</SectionTitle>
        <ChamaList />
      </section>
      <section>
        <SectionTitle>How Pamoja works</SectionTitle>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
          <li>Members pay into the chama's own M-Pesa Paybill/Till or bank account, as they do today.</li>
          <li>The treasurer records each payment here, with the M-Pesa code as proof.</li>
          <li>Each member confirms their entry — or disputes it if something is wrong.</li>
          <li>Everyone sees the same statements, and every change is kept in the audit log.</li>
        </ol>
      </section>
      <Notice>{NON_CUSTODIAL_STATEMENT}</Notice>
    </div>
  );
}
