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
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useWallet } from "@/hooks/useWallet";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import { Tabs } from "@/components/ui/Tabs";
import { useWalletStore } from "@/stores/walletStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Transaction, BankAccount, MpesaAccount, BankProvider } from "@/types";

const statusVariant: Record<Transaction["status"], "success" | "warning" | "danger" | "default"> = {
  completed: "success", pending: "warning", failed: "danger", reversed: "default",
};

const bankLabels: Record<string, string> = {
  equity: "Equity Bank", kcb: "KCB Bank", ncba: "NCBA Bank", cooperative: "Co-op Bank",
  absa: "ABSA Bank", stanbic: "Stanbic Bank", dtb: "DTB Bank", family: "Family Bank",
};

export default function WalletPage() {
  const { wallet, history } = useWallet();
  const { deposit, withdraw } = useWalletStore();
  const transactions = useTransactions();
  const { user } = useAuth();

  // Modals
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [linkBankOpen, setLinkBankOpen] = useState(false);
  const [linkMpesaOpen, setLinkMpesaOpen] = useState(false);

  // Deposit state
  const [depositMethod, setDepositMethod] = useState<"mpesa" | "bank" | "card">("mpesa");
  const [depositAmount, setDepositAmount] = useState("");

  // Withdraw state
  const [withdrawMethod, setWithdrawMethod] = useState<"mpesa" | "bank">("bank");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDestination, setWithdrawDestination] = useState("");

  // Linked accounts (local state, would be API-fetched in production)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: "ba_1", userId: "usr_1", bankName: "equity", accountNumber: "****2342", accountName: "Amara Okafor", isDefault: true, isVerified: true, balance: 245_000, lastSynced: new Date().toISOString(), createdAt: "2025-06-01" },
    { id: "ba_2", userId: "usr_1", bankName: "kcb", accountNumber: "****7891", accountName: "Amara Okafor", isDefault: false, isVerified: true, balance: 180_000, lastSynced: new Date(Date.now() - 3600000).toISOString(), createdAt: "2025-11-15" },
  ]);
  const [mpesaAccounts, setMpesaAccounts] = useState<MpesaAccount[]>([
    { id: "mp_1", userId: "usr_1", phoneNumber: "+254 712 345 678", isDefault: true, isVerified: true, lastUsed: new Date(Date.now() - 1800000).toISOString() },
  ]);

  // Link bank form state
  const [linkBankProvider, setLinkBankProvider] = useState<BankProvider>("equity");
  const [linkBankNumber, setLinkBankNumber] = useState("");
  const [linkBankName, setLinkBankName] = useState("");

  // Link M-Pesa form state
  const [linkMpesaPhone, setLinkMpesaPhone] = useState("");

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

  // ----- Deposit -----
  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 100) {
      toast.error("Minimum deposit is KES 100.");
      return;
    }
    deposit(amount, depositMethod);
    const methodLabel = depositMethod === "mpesa" ? "M-Pesa" : depositMethod === "bank" ? "Bank Transfer" : "Card";
    toast.success(`${formatCurrency(amount)} deposited via ${methodLabel}.`);
    setDepositOpen(false);
    setDepositAmount("");
    setDepositMethod("mpesa");
  };

  // ----- Withdraw -----
  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 100) {
      toast.error("Minimum withdrawal is KES 100.");
      return;
    }
    if (amount > wallet.balance) {
      toast.error(`Insufficient balance. Your balance is ${formatCurrency(wallet.balance)}.`);
      return;
    }
    if (!withdrawDestination.trim()) {
      toast.error("Please enter a destination account or phone number.");
      return;
    }
    withdraw(amount, withdrawMethod);
    const methodLabel = withdrawMethod === "mpesa" ? "M-Pesa" : "Bank";
    toast.success(`${formatCurrency(amount)} withdrawn to ${withdrawDestination} via ${methodLabel}.`);
    setWithdrawOpen(false);
    setWithdrawAmount("");
    setWithdrawDestination("");
    setWithdrawMethod("bank");
  };

  // ----- Link Bank -----
  const handleLinkBank = () => {
    if (!linkBankNumber.trim()) {
      toast.error("Please enter an account number.");
      return;
    }
    if (!linkBankName.trim()) {
      toast.error("Please enter the account holder name.");
      return;
    }
    const masked = linkBankNumber.length > 4 ? `****${linkBankNumber.slice(-4)}` : linkBankNumber;
    const newBank: BankAccount = {
      id: `ba_${Date.now()}`,
      userId: user?.id ?? "usr_1",
      bankName: linkBankProvider,
      accountNumber: masked,
      accountName: linkBankName,
      isDefault: bankAccounts.length === 0,
      isVerified: true,
      balance: 0,
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setBankAccounts([...bankAccounts, newBank]);
    toast.success(`${bankLabels[linkBankProvider]} account linked successfully!`);
    setLinkBankOpen(false);
    setLinkBankProvider("equity");
    setLinkBankNumber("");
    setLinkBankName("");
  };

  // ----- Link M-Pesa -----
  const handleLinkMpesa = () => {
    if (!linkMpesaPhone.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }
    const newMpesa: MpesaAccount = {
      id: `mp_${Date.now()}`,
      userId: user?.id ?? "usr_1",
      phoneNumber: linkMpesaPhone,
      isDefault: mpesaAccounts.length === 0,
      isVerified: true,
      lastUsed: new Date().toISOString(),
    };
    setMpesaAccounts([...mpesaAccounts, newMpesa]);
    toast.success("M-Pesa number linked successfully!");
    setLinkMpesaOpen(false);
    setLinkMpesaPhone("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet & Banking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your money, bank accounts, M-Pesa, and payment methods.</p>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<ArrowDownToLine className="h-4 w-4" />} variant="premium" onClick={() => setDepositOpen(true)}>Deposit</Button>
          <Button leftIcon={<ArrowUpFromLine className="h-4 w-4" />} variant="outline" onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <WalletCard wallet={wallet} />
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
                  <Button size="sm" variant="outline" leftIcon={<Plus className="h-3 w-3" />} onClick={() => setLinkBankOpen(true)}>
                    Link Bank
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {bankAccounts.map((bank) => (
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
                  {bankAccounts.length === 0 && (
                    <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No linked bank accounts yet.</p>
                  )}
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
                  <Button size="sm" variant="outline" leftIcon={<Plus className="h-3 w-3" />} onClick={() => setLinkMpesaOpen(true)}>
                    Link M-Pesa
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {mpesaAccounts.map((mpesa) => (
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
                  {mpesaAccounts.length === 0 && (
                    <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No linked M-Pesa accounts yet.</p>
                  )}
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

      {/* ===== DEPOSIT MODAL ===== */}
      <Modal isOpen={depositOpen} onClose={() => { setDepositOpen(false); setDepositAmount(""); }} title="Deposit Funds" description="Add money to your wallet via M-Pesa, bank transfer, or card.">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Smartphone, value: "mpesa" as const, label: "M-Pesa", desc: "Instant" },
              { icon: Building2, value: "bank" as const, label: "Bank Transfer", desc: "1-2 hours" },
              { icon: CreditCard, value: "card" as const, label: "Card", desc: "Instant" },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setDepositMethod(method.value)}
                className={`card-hover p-4 text-center transition-all ${depositMethod === method.value ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/[0.06] ring-2 ring-brand-500/20" : "hover:border-brand-300 dark:hover:border-brand-500/30"}`}
              >
                <method.icon className={`h-5 w-5 mx-auto mb-1.5 transition-colors ${depositMethod === method.value ? "text-brand-500" : "text-gray-400"}`} />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{method.label}</p>
                <p className="text-[10px] text-gray-400">{method.desc}</p>
              </button>
            ))}
          </div>
          <Input label="Amount (KES)" placeholder="Enter amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          {depositMethod === "mpesa" && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.04] p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <strong>Lipa na M-Pesa:</strong> Paybill 247247, Account: Your Chama ID. Contributions are auto-detected.
            </div>
          )}
          <Button className="w-full" variant="premium" onClick={handleDeposit}>
            Proceed to Pay {depositAmount ? formatCurrency(parseInt(depositAmount)) : ""}
          </Button>
        </div>
      </Modal>

      {/* ===== WITHDRAW MODAL ===== */}
      <Modal isOpen={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmount(""); setWithdrawDestination(""); }} title="Withdraw Funds" description={`Available balance: ${formatCurrency(wallet.balance)}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Building2, value: "bank" as const, label: "Bank Transfer", desc: "1-2 business days" },
              { icon: Smartphone, value: "mpesa" as const, label: "M-Pesa", desc: "Instant" },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setWithdrawMethod(method.value)}
                className={`card-hover p-4 text-center transition-all ${withdrawMethod === method.value ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/[0.06] ring-2 ring-brand-500/20" : "hover:border-brand-300 dark:hover:border-brand-500/30"}`}
              >
                <method.icon className={`h-5 w-5 mx-auto mb-1.5 transition-colors ${withdrawMethod === method.value ? "text-brand-500" : "text-gray-400"}`} />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{method.label}</p>
                <p className="text-[10px] text-gray-400">{method.desc}</p>
              </button>
            ))}
          </div>
          <Input
            label={withdrawMethod === "mpesa" ? "M-Pesa Phone Number" : "Bank Account Number"}
            placeholder={withdrawMethod === "mpesa" ? "+254 7XX XXX XXX" : "Enter account number"}
            value={withdrawDestination}
            onChange={(e) => setWithdrawDestination(e.target.value)}
          />
          <Input label="Amount (KES)" placeholder="Enter amount" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          {parseInt(withdrawAmount) > wallet.balance && (
            <p className="text-xs text-red-500">Amount exceeds available balance of {formatCurrency(wallet.balance)}.</p>
          )}
          <Button className="w-full" variant="premium" onClick={handleWithdraw}>
            Withdraw {withdrawAmount ? formatCurrency(parseInt(withdrawAmount)) : ""}
          </Button>
        </div>
      </Modal>

      {/* ===== LINK BANK MODAL ===== */}
      <Modal isOpen={linkBankOpen} onClose={() => { setLinkBankOpen(false); setLinkBankNumber(""); setLinkBankName(""); }} title="Link Bank Account">
        <div className="space-y-4">
          <Select
            label="Bank"
            value={linkBankProvider}
            onChange={(e) => setLinkBankProvider(e.target.value as BankProvider)}
            options={Object.entries(bankLabels).map(([value, label]) => ({ value, label }))}
          />
          <Input label="Account Number" placeholder="Enter your account number" value={linkBankNumber} onChange={(e) => setLinkBankNumber(e.target.value)} />
          <Input label="Account Holder Name" placeholder="Name on the account" value={linkBankName} onChange={(e) => setLinkBankName(e.target.value)} />
          <Button className="w-full" variant="premium" onClick={handleLinkBank}>
            Link Account
          </Button>
        </div>
      </Modal>

      {/* ===== LINK M-PESA MODAL ===== */}
      <Modal isOpen={linkMpesaOpen} onClose={() => { setLinkMpesaOpen(false); setLinkMpesaPhone(""); }} title="Link M-Pesa Number">
        <div className="space-y-4">
          <Input label="M-Pesa Phone Number" placeholder="+254 7XX XXX XXX" value={linkMpesaPhone} onChange={(e) => setLinkMpesaPhone(e.target.value)} />
          <p className="text-xs text-gray-500 dark:text-gray-400">This number will be used for instant deposits and withdrawals via M-Pesa.</p>
          <Button className="w-full" variant="premium" onClick={handleLinkMpesa}>
            Link M-Pesa
          </Button>
        </div>
      </Modal>
    </div>
  );
}
