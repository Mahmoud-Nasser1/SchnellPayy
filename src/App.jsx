import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import LandingPage from "./pages/landing/Landing";
import AboutPage from "./pages/about/About";
import ContactPage from "./pages/contact/Contact";
import FAQPage from "./pages/faq/FAQ";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/register";
import OtpVerifyPage from "./pages/auth/OtpVerify";
import TwoFactorVerifyPage from "./pages/auth/TwoFactorVerify";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/home/DashboardHome";
import SendMoneyPage from "./pages/dashboard/send/SendMoney";
import ReceiveMoneyPage from "./pages/dashboard/receive/ReceiveMoney";
import TransactionsPage from "./pages/dashboard/transactions/Transactions";
import BillsPage from "./pages/dashboard/bills/Bills";
import FundsPage from "./pages/dashboard/funds/Funds";
import SettingsPage from "./pages/dashboard/settings/Settings";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminServices from "./pages/admin/AdminServices";
import AdminTransactions from "./pages/admin/transactions/AdminTransactions";
import NotFound from "./pages/not-found/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initAuth, loading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
          <p className="font-display font-medium text-muted-foreground animate-pulse">
            Securely connecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FAQPage />} />
      
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/otp-verify" element={<OtpVerifyPage />} />
      <Route path="/2fa" element={<TwoFactorVerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* User Dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="send" element={<SendMoneyPage />} />
          <Route path="receive" element={<ReceiveMoneyPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="funds" element={<FundsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin Dashboard */}
      {/* <Route element={<ProtectedRoute adminOnly />}> */}
        <Route path="/admin" element={<DashboardLayout isAdmin />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kyc" element={<AdminKYC />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="services" element={<AdminServices />} />
        </Route>
      {/* </Route> */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;