import { useState } from "react";
import {
  ArrowDownToLine, ArrowUpFromLine, Building2, Smartphone, CreditCard,
  Plus, CheckCircle, Receipt, QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { WalletCard } from "@/components/cards/WalletCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { WalletHistoryChart } from "@/components/charts/WalletHistoryChart";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/dialogs/Modal";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { useWallet } from "@/hooks/useWallet";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Transaction, BankAccount, MpesaAccount } from "@/types";

const statusVariant: Record<Transaction["status"], "success" | "warning" | "danger" | "default"> = {
  completed: "success", pending: "warning", failed: "danger", reversed: "default",
};

// Mock bank accounts
const BANK_ACCOUNTS: BankAccount[] = [
  { id: "ba_1", userId: "usr_1", bankName: "equity", accountNumber: "****2342", accountName: "Amara Okafor", isDefault: true, isVerified: true, balance: 245_000, lastSynced: new Date().toISOString(), createdAt: "2025-06-01" },
  { id: "ba_2", userId: "usr_1", bankName: "kcb", accountNumber: "****7891", accountName: "Amara Okafor", isDefault: false, isVerified: true, balance: 180_000, lastSynced: new Date(Date.now() - 3600000).toISOString(), createdAt: "2025-11-15" },
];

const MPESA_ACCOUNTS: MpesaAccount[] = [
  { id: "mp_1", userId: "usr_1", phoneNumber: "+254 712 345 678", isDefault: true, isVerified: true, lastUsed: new Date(Date.now() - 1800000).toISOString() },
];

const bankLabels: Record<string, string> = {
  equity: "Equity Bank", kcb: "KCB Bank", ncba: "NCBA Bank", cooperative: "Co-op Bank",
  absa: "ABSA Bank", stanbic: "Stanbic Bank", dtb: "DTB Bank", family: "Family Bank",
};

export default function WalletPage() {
  const { wallet, history } = useWallet();
  const transactions = useTransactions();
  const { user } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const [, setWithdrawOpen] = useState(false);
  const [, setAddBankOpen] = useState(false);

  const myTransactions = transactions.filter((t) => t.userId === user?.id).slice(0, 100);
  const { page, totalPages, paginated, goToPage } = usePagination(myTransactions.length ? myTransactions : transactions.slice(0, 50), 8);

  const columns: Column<Transaction>[] = [
    { key: "reference", header: "Ref" },
    { key: "description", header: "Description" },
    {
      key: "amount",
      header: "Amount",
      render: (t) => (
        <span className={`font-semibold ${t.amount < 0 ? "text-red-500" : "text-emerald-600"}`}>
          {t.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(t.amount))}
        </span>
      ),
    },
    { key: "date", header: "Date", render: (t) => <span className="text-xs">{formatDate(t.date)}</span> },
    {
      key: "status",
      header: "Status",
      render: (t) => <Badge variant={statusVariant[t.status]} dot={t.status === "completed"} className="capitalize text-[11px]">{t.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet & Banking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your money, bank accounts, M-Pesa, and payment methods.</p>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<ArrowDownToLine className="h-4 w-4" />} variant="premium" onClick={() => setDepositOpen(true)}>Deposit</Button>
          <Button leftIcon={<ArrowUpFromLine className="h-4 w-4" />} variant="outline" onClick={() => { setWithdrawOpen(true); toast.info("Withdrawal request submitted for processing."); setWithdrawOpen(false); }}>Withdraw</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <WalletCard wallet={wallet} />
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Deposits", value: formatCurrency(wallet.totalDeposits), icon: ArrowDownToLine, color: "text-emerald-600" },
              { label: "Withdrawals", value: formatCurrency(wallet.totalWithdrawals), icon: ArrowUpFromLine, color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="card-hover p-4 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Balance History" subtitle="Last 90 days">
            <WalletHistoryChart data={history} />
          </ChartCard>
        </div>
      </div>

      {/* Bank & Payment Methods */}
      <Tabs
        items={[
          {
            value: "banks",
            label: "Bank Accounts",
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Linked bank accounts for deposits and withdrawals</p>
                  <Button size="sm" variant="outline" leftIcon={<Plus className="h-3 w-3" />} onClick={() => { setAddBankOpen(true); toast.success("Bank account linked successfully!"); setAddBankOpen(false); }}>
                    Link Bank
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {BANK_ACCOUNTS.map((bank) => (
                    <motion.div key={bank.id} whileHover={{ y: -2 }} className="card-hover p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] text-blue-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{bankLabels[bank.bankName]}</p>
                            <p className="text-xs text-gray-400">{bank.accountNumber} · {bank.accountName}</p>
                          </div>
                        </div>
                        {bank.isDefault && <Badge variant="brand" className="text-[10px]">Default</Badge>}
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.04]">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Balance</p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(bank.balance)}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {/* Link New Bank Card */}
                  <motion.div whileHover={{ y: -2 }} className="card-hover p-5 border-dashed border-2 border-gray-200 dark:border-white/[0.06] flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors" onClick={() => { setAddBankOpen(true); toast.success("Bank account linked!"); setAddBankOpen(false); }}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.04] text-gray-400 mb-2">
                      <Plus className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Link New Bank</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Equity, KCB, NCBA, Co-op...</p>
                  </motion.div>
                </div>
              </div>
            ),
          },
          {
            value: "mpesa",
            label: "M-Pesa",
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">M-Pesa mobile money for instant payments</p>
                  <Button size="sm" variant="outline" leftIcon={<Plus className="h-3 w-3" />} onClick={() => toast.success("M-Pesa number linked!")}>
                    Link M-Pesa
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {MPESA_ACCOUNTS.map((mpesa) => (
                    <motion.div key={mpesa.id} whileHover={{ y: -2 }} className="card-hover p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-600">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">M-Pesa</p>
                            <p className="text-xs text-gray-400">{mpesa.phoneNumber}</p>
                          </div>
                        </div>
                        {mpesa.isDefault && <Badge variant="success" className="text-[10px]">Default</Badge>}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Paybill: 247247</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {/* Lipa na M-Pesa info */}
                  <motion.div whileHover={{ y: -2 }} className="card-hover p-5 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/[0.03] dark:to-transparent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/[0.1] text-emerald-600">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Lipa na M-Pesa</p>
                        <p className="text-[11px] text-gray-400">Instant contributions via M-Pesa</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <p><strong className="text-gray-700 dark:text-gray-300">Paybill:</strong> 247247</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Account:</strong> Your Chama ID</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2">Auto-detected & credited instantly</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            ),
          },
          {
            value: "transactions",
            label: "Transactions",
            content: (
              <div>
                <DataTable data={paginated} columns={columns} keyExtractor={(t) => t.id} />
                <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            ),
          },
        ]}
      />

      {/* Deposit Modal */}
      <Modal isOpen={depositOpen} onClose={() => setDepositOpen(false)} title="Deposit Funds" description="Add money to your wallet via M-Pesa or bank transfer.">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Smartphone, label: "M-Pesa", desc: "Instant" },
              { icon: Building2, label: "Bank Transfer", desc: "1-2 hours" },
              { icon: CreditCard, label: "Card", desc: "Instant" },
            ].map((method) => (
              <button key={method.label} className="card-hover p-4 text-center hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group">
                <method.icon className="h-5 w-5 mx-auto mb-1.5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{method.label}</p>
                <p className="text-[10px] text-gray-400">{method.desc}</p>
              </button>
            ))}
          </div>
          <Input label="Amount (KES)" placeholder="Enter amount" type="number" />
          <Button className="w-full" variant="premium" onClick={() => { setDepositOpen(false); toast.success("Deposit initiated! Funds will reflect shortly."); }}>
            Proceed to Pay
          </Button>
        </div>
      </Modal>
    </div>
  );
}
