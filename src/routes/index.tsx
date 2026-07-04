import { Suspense, type ComponentType } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

const LandingPage = lazy(() => import("@/pages/landing"));
const AboutPage = lazy(() => import("@/pages/public/AboutPage"));
const PrivacyPage = lazy(() => import("@/pages/public/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/public/TermsPage"));
const SecurityPage = lazy(() => import("@/pages/public/SecurityPage"));
const HelpPage = lazy(() => import("@/pages/public/HelpPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const OTPVerificationPage = lazy(() => import("@/pages/auth/OTPVerificationPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const MyChamasPage = lazy(() => import("@/pages/chamas/MyChamasPage"));
const CreateChamaPage = lazy(() => import("@/pages/chamas/CreateChamaPage"));
const JoinChamaPage = lazy(() => import("@/pages/chamas/JoinChamaPage"));
const ChamaDetailPage = lazy(() => import("@/pages/chamas/ChamaDetailPage"));
const MembersPage = lazy(() => import("@/pages/members/MembersPage"));
const TreasuryPage = lazy(() => import("@/pages/treasury/TreasuryPage"));
const LoansPage = lazy(() => import("@/pages/loans/LoansPage"));
const InvestmentsPage = lazy(() => import("@/pages/investments/InvestmentsPage"));
const WalletPage = lazy(() => import("@/pages/wallet/WalletPage"));
const TransactionsPage = lazy(() => import("@/pages/transactions/TransactionsPage"));
const MeetingsPage = lazy(() => import("@/pages/meetings/MeetingsPage"));
const VotingPage = lazy(() => import("@/pages/voting/VotingPage"));
const DocumentsPage = lazy(() => import("@/pages/documents/DocumentsPage"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const AIAssistantPage = lazy(() => import("@/pages/ai-assistant/AIAssistantPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"));
const MessagesPage = lazy(() => import("@/pages/messages/MessagesPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));
const SupportPage = lazy(() => import("@/pages/support/SupportPage"));
const NetworkPage = lazy(() => import("@/pages/network/NetworkPage"));
const NotFoundPage = lazy(() => import("@/pages/not-found/NotFoundPage"));
const DiscoverPage = lazy(() => import("@/pages/Discover"));
const CampaignPage = lazy(() => import("@/pages/Campaign/[slug]"));
const CreateGroupPage = lazy(() => import("@/pages/Create"));
const RuleBuilderPage = lazy(() => import("@/pages/RuleBuilder"));
const AmlDashboardPage = lazy(() => import("@/pages/admin/AmlDashboardPage"));
const ImpactPage = lazy(() => import("@/pages/public/ImpactPage"));
const LearnPage = lazy(() => import("@/pages/public/LearnPage"));
const PricingPage = lazy(() => import("@/pages/Pricing"));
const IntegrationsPage = lazy(() => import("@/pages/Integrations/IntegrationsPage"));
const PublicDonatePage = lazy(() => import("@/pages/public/PublicDonatePage"));
const BylawShowcasePage = lazy(() => import("@/pages/public/BylawShowcasePage"));
const KycWizardPage = lazy(() => import("@/pages/kyc/KycWizardPage"));
const GoalsPage = lazy(() => import("@/pages/goals/GoalsPage"));
const ReferralPage = lazy(() => import("@/pages/referral/ReferralPage"));
const SupportTicketPage = lazy(() => import("@/pages/support/SupportTicketPage"));
const FxConverterPage = lazy(() => import("@/pages/fx/FxConverterPage"));
const ShareLinkPage = lazy(() => import("@/pages/chamas/ShareLinkPage"));
const InvestorPage = lazy(() => import("@/pages/chamas/InvestorPage"));

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<div className="p-8"><SkeletonLoader rows={6} /></div>}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: withSuspense(LandingPage) },
      { path: "/about", element: withSuspense(AboutPage) },
      { path: "/privacy", element: withSuspense(PrivacyPage) },
      { path: "/terms", element: withSuspense(TermsPage) },
      { path: "/security", element: withSuspense(SecurityPage) },
      { path: "/help", element: withSuspense(HelpPage) },
      { path: "/discover", element: withSuspense(DiscoverPage) },
      { path: "/c/:slug", element: withSuspense(CampaignPage) },
      { path: "/pricing", element: withSuspense(PricingPage) },
      { path: "/give/:token", element: withSuspense(PublicDonatePage) },
      { path: "/invest/:token", element: withSuspense(PublicDonatePage) },
      { path: "/bylaws", element: withSuspense(BylawShowcasePage) },
      { path: "/impact", element: withSuspense(ImpactPage) },
      { path: "/learn", element: withSuspense(LearnPage) },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/login", element: withSuspense(LoginPage) },
      { path: "/register", element: withSuspense(RegisterPage) },
      { path: "/forgot-password", element: withSuspense(ForgotPasswordPage) },
      { path: "/otp-verification", element: withSuspense(OTPVerificationPage) },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/dashboard", element: withSuspense(DashboardPage) },
      { path: "/chamas", element: withSuspense(MyChamasPage) },
      { path: "/chamas/create", element: withSuspense(CreateChamaPage) },
      { path: "/chamas/join", element: withSuspense(JoinChamaPage) },
      { path: "/chamas/:id", element: withSuspense(ChamaDetailPage) },
      { path: "/members", element: withSuspense(MembersPage) },
      { path: "/treasury", element: withSuspense(TreasuryPage) },
      { path: "/loans", element: withSuspense(LoansPage) },
      { path: "/investments", element: withSuspense(InvestmentsPage) },
      { path: "/wallet", element: withSuspense(WalletPage) },
      { path: "/transactions", element: withSuspense(TransactionsPage) },
      { path: "/meetings", element: withSuspense(MeetingsPage) },
      { path: "/voting", element: withSuspense(VotingPage) },
      { path: "/documents", element: withSuspense(DocumentsPage) },
      { path: "/analytics", element: withSuspense(AnalyticsPage) },
      { path: "/ai-assistant", element: withSuspense(AIAssistantPage) },
      { path: "/notifications", element: withSuspense(NotificationsPage) },
      { path: "/messages", element: withSuspense(MessagesPage) },
      { path: "/profile", element: withSuspense(ProfilePage) },
      { path: "/settings", element: withSuspense(SettingsPage) },
      { path: "/admin/aml", element: withSuspense(AmlDashboardPage) },
      { path: "/billing", element: withSuspense(BillingPage) },
      { path: "/billing/upgrade", element: withSuspense(BillingPage) },
      { path: "/support", element: withSuspense(SupportPage) },
      { path: "/network", element: withSuspense(NetworkPage) },
      { path: "/create", element: withSuspense(CreateGroupPage) },
      { path: "/rules/builder", element: withSuspense(RuleBuilderPage) },
      { path: "/rules/builder/:groupId", element: withSuspense(RuleBuilderPage) },
      { path: "/kyc", element: withSuspense(KycWizardPage) },
      { path: "/goals", element: withSuspense(GoalsPage) },
      { path: "/referral", element: withSuspense(ReferralPage) },
      { path: "/support/new", element: withSuspense(SupportTicketPage) },
      { path: "/fx", element: withSuspense(FxConverterPage) },
      { path: "/integrations", element: withSuspense(IntegrationsPage) },
      { path: "/chamas/:id/share", element: withSuspense(ShareLinkPage) },
      { path: "/chamas/:id/investors", element: withSuspense(InvestorPage) },
    ],
  },
  { path: "*", element: withSuspense(NotFoundPage) },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
