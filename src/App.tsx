import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NexusBrain from "./pages/NexusBrain";
import TradeCenter from "./pages/TradeCenter";
import ChartVision from "./pages/ChartVision";
import Academy from "./pages/Academy";

import MorningBrief from "./pages/MorningBrief";
import Auth from "./pages/Auth";
import AssetDetail from "./pages/AssetDetail";
import Community from "./pages/Community";
import GoalPlanner from "./pages/GoalPlanner";
import Markets from "./pages/Markets";
import RiskCalculator from "./pages/RiskCalculator";
import Subscription from "./pages/Subscription";
import AdminPanel from "./pages/AdminPanel";
import TradeJournal from "./pages/TradeJournal";
import Hub from "./pages/Hub";
import MyAnalyses from "./pages/MyAnalyses";
import Challenges from "./pages/Challenges";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/nexus-brain" element={<NexusBrain />} />
              <Route path="/trade-center" element={<TradeCenter />} />
              <Route path="/chart-vision" element={<ChartVision />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/morning-brief" element={<MorningBrief />} />
              <Route path="/asset/*" element={<AssetDetail />} />
              <Route path="/community" element={<Community />} />
              <Route path="/goal-planner" element={<GoalPlanner />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/risk-calculator" element={<RiskCalculator />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/trade-journal" element={<TradeJournal />} />
              <Route path="/my-analyses" element={<MyAnalyses />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/admin" element={<AdminPanel />} />
              {/* Legacy redirects */}
              <Route path="/signals" element={<Navigate to="/trade-center" replace />} />
              <Route path="/profile" element={<Navigate to="/hub" replace />} />
              <Route path="/more" element={<Navigate to="/hub" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
