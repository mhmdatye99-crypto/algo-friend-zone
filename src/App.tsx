import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AIScan from "./pages/AIScan";
import Mentor from "./pages/Mentor";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import Auth from "./pages/Auth";
import AssetDetail from "./pages/AssetDetail";
import GoalPlanner from "./pages/GoalPlanner";
import RiskCalculator from "./pages/RiskCalculator";
import Subscription from "./pages/Subscription";
import AdminPanel from "./pages/AdminPanel";
import TradeJournal from "./pages/TradeJournal";
import TradeCenter from "./pages/TradeCenter";
import MyAnalyses from "./pages/MyAnalyses";
import MorningBrief from "./pages/MorningBrief";
import Academy from "./pages/Academy";
import ChartVision from "./pages/ChartVision";
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
              {/* 5 Main Sections */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-scan" element={<AIScan />} />
              <Route path="/mentor" element={<Mentor />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Supporting pages */}
              <Route path="/asset/*" element={<AssetDetail />} />
              <Route path="/trade-center" element={<TradeCenter />} />
              <Route path="/trade-journal" element={<TradeJournal />} />
              <Route path="/goal-planner" element={<GoalPlanner />} />
              <Route path="/risk-calculator" element={<RiskCalculator />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/my-analyses" element={<MyAnalyses />} />
              <Route path="/morning-brief" element={<MorningBrief />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/chart-vision" element={<ChartVision />} />
              <Route path="/admin" element={<AdminPanel />} />

              {/* Legacy redirects */}
              <Route path="/hub" element={<Navigate to="/profile" replace />} />
              <Route path="/signals" element={<Navigate to="/trade-center" replace />} />
              <Route path="/markets" element={<Navigate to="/trade-center" replace />} />
              <Route path="/nexus-brain" element={<Navigate to="/mentor" replace />} />
              <Route path="/challenges" element={<Navigate to="/community" replace />} />
              <Route path="/more" element={<Navigate to="/profile" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
