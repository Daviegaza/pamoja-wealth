import { Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
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
const PricingPage = lazy(() => import("@/pages/Pricing"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const OTPVerificationPage = lazy(() => import("@/pages/auth/OTPVerificationPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const MyChamasPage = lazy(() => import("@/pages/chamas/MyChamasPage"));
const CreateChamaPage = lazy(() => import("@/pages/chamas/CreateChamaPage"));
const JoinChamaPage = lazy(() => import("@/pages/chamas/JoinChamaPage"));
const ChamaWorkspace = lazy(() => import("@/pages/chama/ChamaWorkspace"));
const OverviewTab = lazy(() => import("@/pages/chama/OverviewTab"));
const ContributionsTab = lazy(() => import("@/pages/chama/ContributionsTab"));
const LoansTab = lazy(() => import("@/pages/chama/LoansTab"));
const MeetingsTab = lazy(() => import("@/pages/chama/MeetingsTab"));
const GoalsTab = lazy(() => import("@/pages/chama/GoalsTab"));
const MembersTab = lazy(() => import("@/pages/chama/MembersTab"));
const StatementsTab = lazy(() => import("@/pages/chama/StatementsTab"));
const AuditTab = lazy(() => import("@/pages/chama/AuditTab"));
const BillingTab = lazy(() => import("@/pages/chama/BillingTab"));
const BillingReturnPage = lazy(() => import("@/pages/billing/BillingReturnPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/not-found/NotFoundPage"));

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
      { path: "/pricing", element: withSuspense(PricingPage) },
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
      {
        path: "/chamas/:chamaId",
        element: withSuspense(ChamaWorkspace),
        children: [
          { index: true, element: withSuspense(OverviewTab) },
          { path: "contributions", element: withSuspense(ContributionsTab) },
          { path: "loans", element: withSuspense(LoansTab) },
          { path: "meetings", element: withSuspense(MeetingsTab) },
          { path: "goals", element: withSuspense(GoalsTab) },
          { path: "members", element: withSuspense(MembersTab) },
          { path: "statements", element: withSuspense(StatementsTab) },
          { path: "audit", element: withSuspense(AuditTab) },
          { path: "billing", element: withSuspense(BillingTab) },
        ],
      },
      { path: "/billing/return", element: withSuspense(BillingReturnPage) },
      { path: "/billing", element: <Navigate to="/chamas" replace /> },
      { path: "/notifications", element: withSuspense(NotificationsPage) },
      { path: "/profile", element: withSuspense(ProfilePage) },
      { path: "/settings", element: withSuspense(SettingsPage) },
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
