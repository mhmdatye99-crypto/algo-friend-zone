import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import SignalsPage from "./pages/SignalsPage";
import CommunityPage from "./pages/CommunityPage";

import Auth from "./pages/Auth";
import AssetDetail from "./pages/AssetDetail";
import Subscription from "./pages/Subscription";
import AdminPanel from "./pages/AdminPanel";
import MorningBrief from "./pages/MorningBrief";
import NotFound from "./pages/NotFound";
import ToolsPage from "./pages/ToolsPage";
import JournalPage from "./pages/JournalPage";
import LearningPage from "./pages/LearningPage";
import ChartAnalysisPage from "./pages/ChartAnalysisPage";

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
              {/* 4 Main Tabs */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/signals" element={<SignalsPage />} />
              <Route path="/community" element={<CommunityPage />} />

              {/* Side menu pages */}
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/chart-analysis" element={<ChartAnalysisPage />} />
              <Route path="/morning-brief" element={<MorningBrief />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/admin" element={<AdminPanel />} />

              {/* Supporting */}
              <Route path="/asset/*" element={<AssetDetail />} />

              {/* Legacy redirects */}
              <Route path="/hub" element={<Navigate to="/" replace />} />
              <Route path="/trade-center" element={<Navigate to="/signals" replace />} />
              <Route path="/portfolio" element={<Navigate to="/journal" replace />} />
              <Route path="/profile" element={<Navigate to="/journal" replace />} />
              <Route path="/nexus-brain" element={<Navigate to="/learning" replace />} />
              <Route path="/mentor" element={<Navigate to="/learning" replace />} />
              <Route path="/academy" element={<Navigate to="/learning" replace />} />
              <Route path="/challenges" element={<Navigate to="/community" replace />} />
              <Route path="/more" element={<Navigate to="/" replace />} />
              <Route path="/goal-planner" element={<Navigate to="/tools" replace />} />
              <Route path="/risk-calculator" element={<Navigate to="/tools" replace />} />
              <Route path="/trade-journal" element={<Navigate to="/journal" replace />} />
              <Route path="/my-analyses" element={<Navigate to="/journal" replace />} />
              <Route path="/chart-vision" element={<Navigate to="/chart-analysis" replace />} />
              <Route path="/ai-scan" element={<Navigate to="/chart-analysis" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
