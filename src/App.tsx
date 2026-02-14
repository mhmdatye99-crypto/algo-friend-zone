import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Signals from "./pages/Signals";
import ChartVision from "./pages/ChartVision";
import Academy from "./pages/Academy";
import Profile from "./pages/Profile";
import MorningBrief from "./pages/MorningBrief";
import Auth from "./pages/Auth";
import AssetDetail from "./pages/AssetDetail";
import Community from "./pages/Community";
import GoalPlanner from "./pages/GoalPlanner";
import Markets from "./pages/Markets";
import More from "./pages/More";
import RiskCalculator from "./pages/RiskCalculator";
import Subscription from "./pages/Subscription";
import AdminPanel from "./pages/AdminPanel";
import TradeJournal from "./pages/TradeJournal";
import Hub from "./pages/Hub";
import MyAnalyses from "./pages/MyAnalyses";
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
              <Route path="/signals" element={<Signals />} />
              <Route path="/chart-vision" element={<ChartVision />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/morning-brief" element={<MorningBrief />} />
              <Route path="/asset/:pair" element={<AssetDetail />} />
              <Route path="/community" element={<Community />} />
              <Route path="/goal-planner" element={<GoalPlanner />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/more" element={<Hub />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/risk-calculator" element={<RiskCalculator />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/trade-journal" element={<TradeJournal />} />
              <Route path="/my-analyses" element={<MyAnalyses />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
